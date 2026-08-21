import Link from "next/link";
import { CalendarDays, MessageSquare, Sparkles, UserRound, CalendarX2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { categoryLabel } from "@/lib/constants";
import { durationLabel, formatCredits, formatDate } from "@/lib/format";

export type BookingListItem = {
  id: string;
  date: Date;
  duration: string;
  status: string;
  totalCredits: number;
  specialInstructions: string | null;
  buyer?: { id: string; name: string; image?: string | null; email?: string };
  provider: {
    id: string;
    category: string;
    user: { id?: string; name: string; image?: string | null };
  };
};

export function BookingsList({
  bookings,
  viewerId,
  unreadByBooking,
  emptyState,
}: {
  bookings: BookingListItem[];
  viewerId?: string;
  unreadByBooking?: Map<string, number>;
  emptyState?: { title: string; description: string };
}) {
  if (bookings.length === 0) {
    const title = emptyState?.title ?? "No bookings here yet";
    const description =
      emptyState?.description ??
      "When you book a provider, they'll show up here.";
    const isProvider = emptyState?.title === "No bookings yet";
    return (
      <EmptyState
        icon={CalendarX2}
        title={title}
        description={description}
        action={
          isProvider
            ? undefined
            : { label: "Browse providers", href: "/providers" }
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => {
        const isViewingAsProvider = viewerId != null && booking.provider.user.id === viewerId;
        const shown = isViewingAsProvider
          ? booking.buyer
          : booking.provider.user;

        if (!shown) return null;

        const unreadCount = unreadByBooking?.get(booking.id) ?? 0;

        return (
        <Card key={booking.id}>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {shown.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shown.image}
                    alt={shown.name}
                    className="size-11 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="size-5 text-primary" aria-hidden />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">
                    {shown.name}
                  </p>
                  <Badge variant="secondary">
                    {categoryLabel(booking.provider.category)}
                  </Badge>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="gap-1">
                      <MessageSquare className="size-3" aria-hidden />
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {formatDate(booking.date)}
                  </span>
                  <span>{durationLabel(booking.duration)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Sparkles className="size-3.5 text-primary" aria-hidden />
                    {formatCredits(booking.totalCredits)} cr
                  </span>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <BookingStatusBadge status={booking.status} />
              <Button variant="outline" size="sm" render={<Link href={`/bookings/${booking.id}`} />}>
                View
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}