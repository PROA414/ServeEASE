"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BOOKING_TYPES = [
  "booking_request",
  "booking_confirmed",
  "booking_cancelled",
  "checkin",
  "checkout",
  "payment_released",
  "dispute_filed",
  "dispute_resolved",
];

export async function getNotifications() {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { unread: 0, notifications: [] };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notifyBookings: true, notifyMessages: true },
  });

  const typeFilter: string[] = [];
  if (user?.notifyBookings !== false) typeFilter.push(...BOOKING_TYPES);
  if (user?.notifyMessages !== false) typeFilter.push("message");

  const where = {
    userId: session.user.id,
    ...(typeFilter.length > 0 ? { type: { in: typeFilter } } : { id: "__none__" }),
  };

  const [unread, notifications] = await Promise.all([
    prisma.notification.count({
      where: { ...where, readAt: null },
    }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    unread,
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      readAt: n.readAt,
      createdAt: n.createdAt,
    })),
  };
}

export async function markAllNotificationsRead() {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return;
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/");
}