import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "booking_request"
  | "booking_confirmed"
  | "booking_cancelled"
  | "checkin"
  | "checkout"
  | "payment_released"
  | "dispute_filed"
  | "dispute_resolved"
  | "message";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  bookingId?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      bookingId: input.bookingId,
    },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}