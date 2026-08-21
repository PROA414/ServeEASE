import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BookingsList } from "@/components/bookings/bookings-list";

export const metadata: Metadata = { title: "My Bookings" };

export default async function BookingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?next=/bookings");

  const userId = session.user.id;

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ buyerId: userId }, { provider: { userId } }],
    },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      provider: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const providerProfile = await prisma.serviceProvider.findUnique({
    where: { userId },
    select: { id: true },
  });

  const unreadMessages = await prisma.notification.findMany({
    where: {
      userId,
      readAt: null,
      type: "message",
    },
    select: { bookingId: true },
  });
  const unreadByBooking = new Map<string, number>();
  for (const n of unreadMessages) {
    if (n.bookingId) {
      unreadByBooking.set(n.bookingId, (unreadByBooking.get(n.bookingId) ?? 0) + 1);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          Every booking you&apos;ve made, past and upcoming.
        </p>
      </div>
      <BookingsList
        bookings={bookings}
        viewerId={session.user.id}
        unreadByBooking={unreadByBooking}
        emptyState={
          providerProfile
            ? {
                title: "No bookings yet",
                description:
                  "When someone books you as a provider, the booking will show up here.",
              }
            : undefined
        }
      />
    </div>
  );
}