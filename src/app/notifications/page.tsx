import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { markAllNotificationsRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?next=/notifications");

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notifyBookings: true, notifyMessages: true },
  });

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

  const typeFilter: string[] = [];
  if (user?.notifyBookings !== false) typeFilter.push(...BOOKING_TYPES);
  if (user?.notifyMessages !== false) typeFilter.push("message");

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(typeFilter.length > 0 ? { type: { in: typeFilter } } : { id: "__none__" }),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Updates on your bookings and messages.</p>
        </div>
        <form action={markAllNotificationsRead}>
          <Button type="submit" variant="outline" size="sm">
            Mark all read
          </Button>
        </form>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Bell className="size-6 text-muted-foreground" aria-hidden />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground">
            You&apos;ll see booking updates and new messages here.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex flex-col gap-1 p-4 ${!n.readAt ? "bg-primary/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm ${!n.readAt ? "font-semibold" : ""}`}>{n.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <a href={n.link} className="text-sm text-primary hover:underline">
                View details
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}