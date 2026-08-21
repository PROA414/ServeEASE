"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  readAt: Date | null;
  createdAt: Date;
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const data = await fetch("/api/notifications").then((r) => r.json());
    setNotifications(data.notifications);
    setUnread(data.unread);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unread > 0 && notifications.length > 0) {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then(() => {
        setUnread(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
      });
    }
  };

  const handleClick = (n: Notification) => {
    setOpen(false);
    if (!n.readAt) {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [n.id] }),
      }).then(() => {
        setUnread((prev) => Math.max(0, prev - 1));
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date() } : x)));
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" aria-label="Notifications" />}
        className="relative"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-medium">Notifications</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={() => {
              fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              }).then(() => {
                setUnread(0);
                setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
              });
            }} className="h-6 text-xs">
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="size-5" aria-hidden />
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link}
                onClick={() => handleClick(n)}
                className={cn(
                  "block border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/50",
                  !n.readAt && "bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm", !n.readAt && "font-semibold")}>{n.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}