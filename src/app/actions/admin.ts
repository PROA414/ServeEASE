"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
  return Boolean(session?.user && (session.user as { isAdmin?: boolean }).isAdmin === true);
}

export async function getAdminStats() {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!isAdmin(session)) {
    return null;
  }

  const [users, providers, bookings, transactions] = await Promise.all([
    prisma.user.count(),
    prisma.serviceProvider.count(),
    prisma.booking.count(),
    prisma.creditTransaction.aggregate({
      where: { type: "purchase" },
      _sum: { amount: true },
    }),
  ]);

  return {
    users,
    providers,
    bookings,
    revenue: transactions._sum.amount ?? 0,
  };
}

const PAGE_SIZE = 10;

function clampPage(page: number | undefined) {
  if (!Number.isFinite(page) || (page ?? 0) < 1) return 1;
  return Math.floor(page!);
}

async function pagedQuery<T>(query: (skip: number, take: number) => Promise<T[]>, count: () => Promise<number>, page: number | undefined) {
  const requested = clampPage(page);
  const total = await count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(requested, totalPages);
  const items = await query((safePage - 1) * PAGE_SIZE, PAGE_SIZE);
  return {
    items,
    pagination: {
      page: safePage,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
    },
  };
}

export async function getAdminBookings(page?: number) {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!isAdmin(session)) {
    return null;
  }

  return pagedQuery(
    (skip, take) =>
      prisma.booking.findMany({
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          provider: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    () => prisma.booking.count(),
    page
  );
}

export async function getAdminUsers(page?: number) {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!isAdmin(session)) {
    return null;
  }

  return pagedQuery(
    (skip, take) =>
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          providerProfile: { select: { id: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    () => prisma.user.count(),
    page
  );
}

export async function getAdminDisputes(page?: number) {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!isAdmin(session)) {
    return null;
  }

  return pagedQuery(
    (skip, take) =>
      prisma.dispute.findMany({
        include: {
          filedBy: { select: { id: true, name: true, email: true } },
          booking: {
            include: {
              buyer: { select: { id: true, name: true, email: true } },
              provider: {
                include: { user: { select: { id: true, name: true, email: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    () => prisma.dispute.count(),
    page
  );
}

export type ResolveDisputeResult =
  | { success: true }
  | { success: false; error: string };

export async function resolveDispute(
  disputeId: string,
  decision: "refund_buyer" | "pay_provider",
  adminNote: string
): Promise<ResolveDisputeResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!isAdmin(session)) {
    return { success: false, error: "Unauthorized" };
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: { include: { provider: true } },
    },
  });

  if (!dispute) {
    return { success: false, error: "Dispute not found" };
  }

  if (dispute.status !== "open") {
    return { success: false, error: "This dispute is already resolved" };
  }

  await prisma.$transaction(async (tx) => {
    if (decision === "refund_buyer") {
      const buyerBalance = await tx.creditTransaction.aggregate({
        where: { userId: dispute.booking.buyerId },
        _sum: { amount: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId: dispute.booking.buyerId,
          amount: dispute.booking.totalCredits,
          balance: (buyerBalance._sum.amount ?? 0) + dispute.booking.totalCredits,
          type: "refund",
          reference: dispute.booking.id,
          description: `Dispute resolved in buyer's favor for booking ${dispute.booking.id}`,
          status: "completed",
        },
      });

      await tx.booking.update({
        where: { id: dispute.booking.id },
        data: { status: "refunded" },
      });
    } else {
      const providerBalance = await tx.creditTransaction.aggregate({
        where: { userId: dispute.booking.provider.userId },
        _sum: { amount: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId: dispute.booking.provider.userId,
          amount: dispute.booking.totalCredits,
          balance: (providerBalance._sum.amount ?? 0) + dispute.booking.totalCredits,
          type: "payout",
          reference: dispute.booking.id,
          description: `Dispute resolved in provider's favor for booking ${dispute.booking.id}`,
          status: "completed",
        },
      });

      await tx.booking.update({
        where: { id: dispute.booking.id },
        data: { status: "released" },
      });
    }

    await tx.dispute.update({
      where: { id: dispute.id },
      data: {
        status: "resolved",
        resolution: decision,
        adminNote: adminNote.trim() || null,
        resolvedAt: new Date(),
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  const outcome =
    decision === "refund_buyer"
      ? { title: "Dispute resolved", body: "The dispute on this booking was resolved in the buyer's favor. Your credits were refunded." }
      : { title: "Dispute resolved", body: "The dispute on this booking was resolved in the provider's favor. Payment was released." };

  await Promise.all([
    createNotification({
      userId: dispute.booking.buyerId,
      type: "dispute_resolved",
      title: outcome.title,
      body: decision === "refund_buyer"
        ? "A dispute on one of your bookings was resolved — you received a full refund."
        : "A dispute on one of your bookings was resolved in the provider's favor.",
      link: `/bookings/${dispute.booking.id}`,
      bookingId: dispute.booking.id,
    }),
    createNotification({
      userId: dispute.booking.provider.userId,
      type: "dispute_resolved",
      title: outcome.title,
      body: decision === "pay_provider"
        ? "A dispute on one of your bookings was resolved — the payment was released to you."
        : "A dispute on one of your bookings was resolved in the buyer's favor.",
      link: `/bookings/${dispute.booking.id}`,
      bookingId: dispute.booking.id,
    }),
  ]);

  return { success: true };
}

export async function refundBooking(bookingId: string) {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!isAdmin(session)) {
    return { success: false, error: "Unauthorized" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  if (booking.status === "refunded" || booking.status === "cancelled") {
    return { success: false, error: "Booking already refunded" };
  }

  await prisma.$transaction(async (tx) => {
    const buyerBalance = await tx.creditTransaction.aggregate({
      where: { userId: booking.buyerId },
      _sum: { amount: true },
    });

    await tx.creditTransaction.create({
      data: {
        userId: booking.buyerId,
        amount: booking.totalCredits,
        balance: (buyerBalance._sum.amount ?? 0) + booking.totalCredits,
        type: "refund",
        reference: bookingId,
        description: `Admin refund for booking ${bookingId}`,
        status: "completed",
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "refunded" },
    });
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function adjustUserCredits(
  userId: string,
  amount: number,
  description: string
) {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!isAdmin(session)) {
    return { success: false, error: "Unauthorized" };
  }

  const currentBalance = await prisma.creditTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  const balance = currentBalance._sum.amount ?? 0;

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount,
      balance: balance + amount,
      type: amount >= 0 ? "purchase" : "refund",
      description: description || "Admin credit adjustment",
      status: "completed",
    },
  });

  revalidatePath("/admin");
  return { success: true };
}
