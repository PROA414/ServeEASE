import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { buyerId: true, provider: { select: { userId: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isParty =
    session.user.id === booking.buyerId ||
    session.user.id === booking.provider.userId;

  if (!isParty) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { bookingId: id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderId: m.senderId,
      senderName: m.sender.name,
      isMine: m.senderId === session.user.id,
    }))
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const key = rateLimitKey(request, `chat:${id}`);
  const limit = rateLimit(key, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }

  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { buyerId: true, provider: { select: { userId: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isParty =
    session.user.id === booking.buyerId ||
    session.user.id === booking.provider.userId;

  if (!isParty) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.content !== "string" || body.content.trim().length === 0) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      bookingId: id,
      senderId: session.user.id,
      content: body.content.trim(),
    },
    include: { sender: { select: { id: true, name: true } } },
  });

  const otherPartyId =
    session.user.id === booking.buyerId ? booking.provider.userId : booking.buyerId;

  await createNotification({
    userId: otherPartyId,
    type: "message",
    title: `New message from ${message.sender.name}`,
    body: message.content,
    link: `/bookings/${id}/chat`,
    bookingId: id,
  });

  return NextResponse.json(
    {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: message.sender.name,
      isMine: true,
    },
    { status: 201 }
  );
}
