import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ChatClient } from "@/components/bookings/chat-client";

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
    title: `Chat — ${booking.provider.user.name}`,
  };
}

export default async function BookingChatPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true } },
      provider: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!booking) notFound();

  const isBuyer = session.user.id === booking.buyerId;
  const isProvider = session.user.id === booking.provider.userId;

  if (!isBuyer && !isProvider) {
    redirect("/bookings");
  }

  const otherParty = isBuyer
    ? { id: booking.provider.userId, name: booking.provider.user.name }
    : { id: booking.buyerId, name: booking.buyer.name };

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      bookingId: id,
      type: "message",
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Conversation with <span className="font-medium text-foreground">{otherParty.name}</span>
        </p>
      </div>
      <ChatClient
        bookingId={id}
        currentUserId={session.user.id}
        otherParty={otherParty}
      />
    </div>
  );
}
