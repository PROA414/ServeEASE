import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNotifications, markAllNotificationsRead } from "@/app/actions/notifications";
import { createNotification } from "@/lib/notifications";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    notification: {
      count: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

describe("notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createNotification creates a row for the user", async () => {
    vi.mocked(prisma.notification.create).mockResolvedValue({
      id: "notif-1",
    } as any);

    await createNotification({
      userId: "user-1",
      type: "booking_request",
      title: "New booking request",
      body: "A new booking was requested.",
      link: "/bookings/b-1",
      bookingId: "b-1",
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: "booking_request",
        title: "New booking request",
        body: "A new booking was requested.",
        link: "/bookings/b-1",
        bookingId: "b-1",
      },
    });
  });

  it("getNotifications returns empty when not signed in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await getNotifications();

    expect(result).toEqual({ unread: 0, notifications: [] });
  });

  it("getNotifications returns unread count and recent notifications", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      notifyBookings: true,
      notifyMessages: true,
    } as any);
    vi.mocked(prisma.notification.count).mockResolvedValue(2);
    vi.mocked(prisma.notification.findMany).mockResolvedValue([
      {
        id: "n1",
        type: "message",
        title: "New message",
        body: "Hello",
        link: "/bookings/b1/chat",
        readAt: null,
        createdAt: new Date("2026-01-01"),
      },
      {
        id: "n2",
        type: "booking_confirmed",
        title: "Booking confirmed",
        body: "Your booking was accepted.",
        link: "/bookings/b1",
        readAt: new Date("2026-01-02"),
        createdAt: new Date("2026-01-02"),
      },
    ] as any);

    const result = await getNotifications();

    expect(result.unread).toBe(2);
    expect(result.notifications).toHaveLength(2);
    expect(result.notifications[0].id).toBe("n1");
  });

  it("markAllNotificationsRead updates only unread rows for the user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 3 } as any);

    await markAllNotificationsRead();

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });
});