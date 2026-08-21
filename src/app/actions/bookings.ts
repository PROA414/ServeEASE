"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import BookingConfirmationEmail from "@/emails/booking-confirmation";
import BookingCancelledEmail from "@/emails/booking-cancelled";
import NewBookingAlertEmail from "@/emails/new-booking-alert";
import PaymentReleasedEmail from "@/emails/payment-released";

async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  try {
    const html = await render(react);
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/emails/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Failed to send email:", data.error ?? res.statusText);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

const createBookingSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  date: z.coerce.date(),
  duration: z.enum(["full", "half"], {
    message: "Choose a duration",
  }),
  specialInstructions: z
    .string()
    .max(500, "Instructions must be under 500 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export type CreateBookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

function isBookingDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in to book a provider." };
  }

  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid booking details.";
    return { success: false, error: message };
  }

  const { providerId, date, duration, specialInstructions } = parsed.data;

  if (isBookingDateInPast(date)) {
    return { success: false, error: "Please pick a date in the future." };
  }

  const bookingDate = new Date(date);
  bookingDate.setHours(12, 0, 0, 0);

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    select: { id: true, dailyRate: true, halfDayRate: true, availableDays: true },
  });

  if (!provider) {
    return { success: false, error: "That provider is no longer available." };
  }

  if (provider.availableDays) {
    const days = provider.availableDays
      .split(",")
      .map((d) => Number(d))
      .filter((d) => Number.isInteger(d));
    if (days.length > 0 && !days.includes(bookingDate.getDay())) {
      return {
        success: false,
        error: "The provider isn't available on that day. Pick a different date.",
      };
    }
  }

  const totalCredits =
    duration === "full" ? provider.dailyRate : provider.halfDayRate;

  const buyerId = session.user.id;

  const balanceResult = await prisma.creditTransaction.aggregate({
    where: { userId: buyerId },
    _sum: { amount: true },
  });
  const balance = balanceResult._sum.amount ?? 0;

  if (balance < totalCredits) {
    return {
      success: false,
      error: "Insufficient credits. Please purchase more.",
    };
  }

  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const conflict = await tx.booking.findFirst({
        where: {
          providerId,
          date: { gte: startOfDay, lte: endOfDay },
          status: { in: ["pending", "confirmed", "in_progress"] },
        },
        select: { id: true },
      });

      if (conflict) {
        throw new BookingConflictError(
          "This provider is already booked on that date. Please pick another day."
        );
      }

      const newBooking = await tx.booking.create({
        data: {
          buyerId,
          providerId,
          date: bookingDate,
          duration,
          totalCredits,
          specialInstructions: specialInstructions || null,
          status: "pending",
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: buyerId,
          amount: -totalCredits,
          balance: balance - totalCredits,
          type: "hold",
          reference: newBooking.id,
          description: `Held in escrow for booking ${newBooking.id}`,
          status: "held",
        },
      });

      return newBooking;
    });
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/providers");

  const [buyer, providerAccount] = await Promise.all([
    prisma.user.findUnique({ where: { id: buyerId }, select: { email: true, name: true } }),
    prisma.serviceProvider.findUnique({ where: { id: booking.providerId }, include: { user: { select: { id: true, email: true, name: true } } } }),
  ]);

  if (buyer && providerAccount) {
    const dateStr = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const durationLabel = booking.duration === "full" ? "Full Day (8 hours)" : "Half Day (4 hours)";

    await Promise.all([
      createNotification({
        userId: providerAccount.user.id,
        type: "booking_request",
        title: "New booking request",
        body: `${buyer.name} requested a booking for ${dateStr}.`,
        link: `/bookings/${booking.id}`,
        bookingId: booking.id,
      }),
      sendEmail({
        to: buyer.email,
        subject: `Booking confirmed — ${providerAccount.user.name}`,
        react: BookingConfirmationEmail({
          bookingId: booking.id,
          providerName: providerAccount.user.name,
          date: dateStr,
          duration: durationLabel,
          credits: booking.totalCredits,
        }),
      }),
      sendEmail({
        to: providerAccount.user.email,
        subject: `New booking from ${buyer.name}`,
        react: NewBookingAlertEmail({
          bookingId: booking.id,
          buyerName: buyer.name,
          date: dateStr,
          duration: durationLabel,
          credits: booking.totalCredits,
        }),
      }),
    ]);
  }

  return { success: true, bookingId: booking.id };
}

class BookingConflictError extends Error {}

export type AcceptBookingResult =
  | { success: true }
  | { success: false; error: string };

export async function acceptBooking(
  bookingId: string
): Promise<AcceptBookingResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: { include: { user: { select: { name: true } } } } },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.provider.userId !== session.user.id) {
    return { success: false, error: "You are not authorized to accept this booking." };
  }

  if (booking.status !== "pending") {
    return { success: false, error: "This booking can no longer be accepted." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "confirmed" },
  });

  await createNotification({
    userId: booking.buyerId,
    type: "booking_confirmed",
    title: "Booking confirmed",
    body: `${booking.provider.user.name} accepted your booking.`,
    link: `/bookings/${bookingId}`,
    bookingId,
  });

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  return { success: true };
}

export type FileDisputeResult =
  | { success: true }
  | { success: false; error: string };

export async function fileDispute(
  bookingId: string,
  reason: string
): Promise<FileDisputeResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { success: false, error: "Please describe why you're filing a dispute." };
  }
  if (trimmedReason.length > 1000) {
    return { success: false, error: "Dispute reason must be under 1000 characters." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  const isParty = booking.buyerId === session.user.id || booking.provider.userId === session.user.id;
  if (!isParty) {
    return { success: false, error: "You are not a party to this booking." };
  }

  const disputableStatuses = ["pending", "confirmed", "in_progress", "completed"];
  if (!disputableStatuses.includes(booking.status)) {
    return {
      success: false,
      error: "This booking can no longer be disputed.",
    };
  }

  const existing = await prisma.dispute.findUnique({
    where: { bookingId },
    select: { id: true },
  });

  if (existing) {
    return { success: false, error: "A dispute has already been filed for this booking." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.dispute.create({
      data: {
        bookingId,
        filedById: session.user!.id,
        reason: trimmedReason,
        status: "open",
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "disputed" },
    });
  });

  const otherPartyId =
    booking.buyerId === session.user.id ? booking.provider.userId : booking.buyerId;

  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true },
  });

  await Promise.all([
    createNotification({
      userId: otherPartyId,
      type: "dispute_filed",
      title: "Dispute filed",
      body: "A dispute was filed on this booking. It will be reviewed by our team.",
      link: `/bookings/${bookingId}`,
      bookingId,
    }),
    ...admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: "dispute_filed",
        title: "New dispute to review",
        body: `A dispute was filed on booking ${bookingId}.`,
        link: `/admin`,
        bookingId,
      })
    ),
  ]);

  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: true };
}

export type CancelBookingResult =
  | { success: true }
  | { success: false; error: string };

export async function cancelBookingByProvider(
  bookingId: string
): Promise<CancelBookingResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      buyerId: true,
      status: true,
      totalCredits: true,
      date: true,
      provider: { select: { userId: true, user: { select: { name: true } } } },
    },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.provider.userId !== session.user.id) {
    return { success: false, error: "You are not authorized to cancel this booking." };
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return {
      success: false,
      error: "This booking can no longer be cancelled.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });

    const currentBalance = await tx.creditTransaction.aggregate({
      where: { userId: booking.buyerId },
      _sum: { amount: true },
    });

    const balance = currentBalance._sum.amount ?? 0;

    await tx.creditTransaction.create({
      data: {
        userId: booking.buyerId,
        amount: booking.totalCredits,
        balance: balance + booking.totalCredits,
        type: "refund",
        reference: bookingId,
        description: `Refund — provider cancelled booking ${bookingId}`,
        status: "completed",
      },
    });
  });

  const buyerAccount = await prisma.user.findUnique({
    where: { id: booking.buyerId },
    select: { email: true, name: true },
  });

  const dateStr = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await Promise.all([
    createNotification({
      userId: booking.buyerId,
      type: "booking_cancelled",
      title: "Booking cancelled",
      body: `${booking.provider.user.name} cancelled the booking for ${dateStr}. Your credits have been refunded.`,
      link: `/bookings/${bookingId}`,
      bookingId,
    }),
    ...(buyerAccount
      ? [
          sendEmail({
            to: buyerAccount.email,
            subject: `Booking cancelled — ${dateStr}`,
            react: BookingCancelledEmail({
              bookingId,
              cancelledByName: booking.provider.user.name,
              date: dateStr,
              credits: booking.totalCredits,
            }),
          }),
        ]
      : []),
  ]);

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function cancelBooking(
  bookingId: string
): Promise<CancelBookingResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      buyerId: true,
      date: true,
      status: true,
      totalCredits: true,
      provider: { select: { userId: true, user: { select: { name: true } } } },
    },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.buyerId !== session.user.id) {
    return { success: false, error: "You are not authorized to cancel this booking." };
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return {
      success: false,
      error: "This booking can no longer be cancelled.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });

    const currentBalance = await tx.creditTransaction.aggregate({
      where: { userId: session.user!.id },
      _sum: { amount: true },
    });

    const balance = currentBalance._sum.amount ?? 0;

    await tx.creditTransaction.create({
      data: {
        userId: session.user!.id,
        amount: booking.totalCredits,
        balance: balance + booking.totalCredits,
        type: "refund",
        reference: bookingId,
        description: `Refund for cancelled booking ${bookingId}`,
        status: "completed",
      },
    });
  });

  const [providerAccount, buyerAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: booking.provider.userId },
      select: { email: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user!.id },
      select: { name: true },
    }),
  ]);

  const dateStr = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await Promise.all([
    createNotification({
      userId: booking.provider.userId,
      type: "booking_cancelled",
      title: "Booking cancelled",
      body: "A client cancelled their booking. The scheduled date is now free.",
      link: `/bookings/${bookingId}`,
      bookingId,
    }),
    ...(providerAccount && buyerAccount
      ? [
          sendEmail({
            to: providerAccount.email,
            subject: `Booking cancelled — ${dateStr}`,
            react: BookingCancelledEmail({
              bookingId,
              cancelledByName: buyerAccount.name,
              date: dateStr,
              credits: booking.totalCredits,
            }),
          }),
        ]
      : []),
  ]);

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  return { success: true };
}

export type CheckInResult =
  | { success: true }
  | { success: false; error: string };

export async function checkIn(
  bookingId: string,
  input: { lat: number; lng: number; photo: string }
): Promise<CheckInResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.provider.userId !== session.user.id) {
    return { success: false, error: "You are not authorized to check in." };
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return {
      success: false,
      error: "This booking cannot be checked in.",
    };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "in_progress",
      checkInAt: new Date(),
      checkInLat: input.lat,
      checkInLng: input.lng,
      checkInPhoto: input.photo,
    },
  });

  await createNotification({
    userId: booking.buyerId,
    type: "checkin",
    title: "Check-in",
    body: "Your provider has checked in and started work.",
    link: `/bookings/${bookingId}`,
    bookingId,
  });

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  return { success: true };
}

export type CheckOutResult =
  | { success: true }
  | { success: false; error: string };

export async function checkOut(
  bookingId: string,
  input: { lat: number; lng: number; photo: string }
): Promise<CheckOutResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.provider.userId !== session.user.id) {
    return { success: false, error: "You are not authorized to check out." };
  }

  if (booking.status !== "in_progress") {
    return {
      success: false,
      error: "This booking is not in progress.",
    };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "completed",
      checkOutAt: new Date(),
      checkOutLat: input.lat,
      checkOutLng: input.lng,
      checkOutPhoto: input.photo,
    },
  });

  await createNotification({
    userId: booking.buyerId,
    type: "checkout",
    title: "Check-out",
    body: "Your provider has checked out. Review the work and release payment.",
    link: `/bookings/${bookingId}`,
    bookingId,
  });

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  return { success: true };
}

export type ReleasePaymentResult =
  | { success: true }
  | { success: false; error: string };

export async function releasePayment(
  bookingId: string
): Promise<ReleasePaymentResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.buyerId !== session.user.id) {
    return { success: false, error: "You are not authorized to release this payment." };
  }

  if (booking.status !== "completed") {
    return {
      success: false,
      error: "This booking is not completed yet.",
    };
  }

  await prisma.$transaction(async (tx) => {
    const providerBalanceResult = await tx.creditTransaction.aggregate({
      where: { userId: booking.provider.userId },
      _sum: { amount: true },
    });

    const providerBalance = providerBalanceResult._sum.amount ?? 0;

    await tx.creditTransaction.create({
      data: {
        userId: booking.provider.userId,
        amount: booking.totalCredits,
        balance: providerBalance + booking.totalCredits,
        type: "payout",
        reference: bookingId,
        description: `Payment for booking ${bookingId}`,
        status: "completed",
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "released" },
    });
  });

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  const provider = await prisma.user.findUnique({
    where: { id: booking.provider.userId },
    select: { email: true },
  });

  if (provider) {
    await sendEmail({
      to: provider.email,
      subject: `Payment released — ${booking.totalCredits} credits`,
      react: PaymentReleasedEmail({
        bookingId,
        credits: booking.totalCredits,
      }),
    });
  }

  await createNotification({
    userId: booking.provider.userId,
    type: "payment_released",
    title: "Payment released",
    body: `${booking.totalCredits} credits from this booking were added to your balance.`,
    link: `/bookings/${bookingId}`,
    bookingId,
  });

  return { success: true };
}