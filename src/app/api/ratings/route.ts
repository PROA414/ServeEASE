import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.bookingId !== "string" || typeof body.rating !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { bookingId, rating, comment } = body;

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "released") {
    return NextResponse.json(
      { error: "You can only rate released bookings" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    const completedBookings = await tx.booking.findMany({
      where: {
        providerId: booking.providerId,
        status: "released",
      },
      select: { rating: true },
    });

    const ratings = completedBookings.map((b) => b.rating).filter(Boolean) as number[];
    ratings.push(rating);

    const average = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;

    await tx.serviceProvider.update({
      where: { id: booking.providerId },
      data: {
        rating: Math.round(average * 10) / 10,
        totalBookings: { increment: 1 },
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        rating,
        comment: comment || null,
      },
    });
  });

  return NextResponse.json({ success: true });
}
