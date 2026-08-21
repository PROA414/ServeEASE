import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BookingDetailClient } from "@/components/bookings/booking-detail-client";
import { categoryLabel } from "@/lib/constants";

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      provider: { include: { user: { select: { name: true } } } },
    },
  });

  if (!booking) return { title: "Booking not found" };

  return {
    title: `Booking with ${booking.provider.user.name} — ${categoryLabel(booking.provider.category)}`,
  };
}

export default async function BookingDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      provider: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      dispute: {
        include: {
          filedBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!booking) notFound();

  const isBuyer = session.user.id === booking.buyerId;
  const isProvider = session.user.id === booking.provider.userId;

  if (!isBuyer && !isProvider) {
    redirect("/bookings");
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Booking details</h1>
        <p className="text-muted-foreground">
          {isBuyer
            ? "Your booking with"
            : "Booking from"}{" "}
          <span className="font-medium text-foreground">
            {booking.provider.user.name}
          </span>{" "}
          ({categoryLabel(booking.provider.category)})
        </p>
      </div>

      <BookingDetailClient
        booking={booking}
        isBuyer={isBuyer}
        isProvider={isProvider}
        currentUserId={session.user.id}
      />
    </div>
  );
}
