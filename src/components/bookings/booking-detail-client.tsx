"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { CheckInForm } from "@/components/bookings/check-in-form";
import { CheckOutForm } from "@/components/bookings/check-out-form";
import { ReleasePaymentForm } from "@/components/bookings/release-payment-form";
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { CancelProviderButton } from "@/components/bookings/cancel-provider-button";
import { AcceptBookingButton } from "@/components/bookings/accept-booking-button";
import { FileDisputeButton } from "@/components/bookings/file-dispute-button";
import { categoryLabel } from "@/lib/constants";
import { formatCredits, formatDate, durationLabel } from "@/lib/format";
import {
  CalendarDays,
  Clock,
  Sparkles,
  MessageSquare,
  Scale,
} from "lucide-react";
import Link from "next/link";

type Booking = {
  id: string;
  date: Date;
  duration: string;
  status: string;
  totalCredits: number;
  specialInstructions: string | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkInPhoto: string | null;
  checkOutPhoto: string | null;
  buyer: { id: string; name: string; email: string };
  provider: {
    id: string;
    category: string;
    user: { id: string; name: string; image: string | null };
  };
  dispute: {
    id: string;
    status: string;
    reason: string;
    resolution: string | null;
    adminNote: string | null;
    filedBy: { id: string; name: string };
  } | null;
};

type BookingDetailClientProps = {
  booking: Booking;
  isBuyer: boolean;
  isProvider: boolean;
  currentUserId: string;
};

export function BookingDetailClient({
  booking,
  isBuyer,
  isProvider,
}: BookingDetailClientProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const canCancel = useMemo(
    () => isBuyer && ["pending", "confirmed"].includes(booking.status),
    [isBuyer, booking.status]
  );

  const canProviderCancel = useMemo(
    () => isProvider && ["pending", "confirmed"].includes(booking.status),
    [isProvider, booking.status]
  );

  const canAccept = useMemo(
    () => isProvider && booking.status === "pending",
    [isProvider, booking.status]
  );

  const canCheckIn = useMemo(
    () => isProvider && ["pending", "confirmed"].includes(booking.status),
    [isProvider, booking.status]
  );

  const canCheckOut = useMemo(
    () => isProvider && booking.status === "in_progress",
    [isProvider, booking.status]
  );

  const canRelease = useMemo(
    () => isBuyer && booking.status === "completed",
    [isBuyer, booking.status]
  );

  const canDispute = useMemo(
    () =>
      !booking.dispute &&
      ["pending", "confirmed", "in_progress", "completed"].includes(booking.status),
    [booking.dispute, booking.status]
  );

  const showCheckInPhoto = useMemo(() => Boolean(booking.checkInPhoto), [booking.checkInPhoto]);
  const showCheckOutPhoto = useMemo(() => Boolean(booking.checkOutPhoto), [booking.checkOutPhoto]);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="flex items-center gap-1 font-semibold">
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  {formatCredits(booking.totalCredits)} credits
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                <div>
                  <p className="font-medium">{formatDate(booking.date)}</p>
                  <p className="text-muted-foreground">Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="size-4 text-muted-foreground" aria-hidden />
                <div>
                  <p className="font-medium">{durationLabel(booking.duration)}</p>
                  <p className="text-muted-foreground">Duration</p>
                </div>
              </div>
            </div>

            {booking.specialInstructions && (
              <>
                <Separator />
                <div className="grid gap-1 text-sm">
                  <p className="font-medium">Special instructions</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {booking.specialInstructions}
                  </p>
                </div>
              </>
            )}

            {(showCheckInPhoto || showCheckOutPhoto) && (
              <>
                <Separator />
                <div className="grid gap-2 text-sm">
                  <p className="font-medium">Photos</p>
                  <div className="flex flex-wrap gap-3">
                    {showCheckInPhoto && (
                      <button
                        type="button"
                        className="rounded-lg border p-1"
                        onClick={() => setPhotoPreview(booking.checkInPhoto)}
                      >
                        <img
                          src={booking.checkInPhoto!}
                          alt="Check-in photo"
                          className="size-24 rounded-md object-cover"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Before</p>
                      </button>
                    )}
                    {showCheckOutPhoto && (
                      <button
                        type="button"
                        className="rounded-lg border p-1"
                        onClick={() => setPhotoPreview(booking.checkOutPhoto)}
                      >
                        <img
                          src={booking.checkOutPhoto!}
                          alt="Check-out photo"
                          className="size-24 rounded-md object-cover"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">After</p>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Provider</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                {booking.provider.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={booking.provider.user.image}
                    alt={booking.provider.user.name}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-primary">
                    {booking.provider.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{booking.provider.user.name}</p>
                <p className="text-muted-foreground">
                  {categoryLabel(booking.provider.category)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href={`/bookings/${booking.id}/chat`} />}
            >
              <MessageSquare className="size-4" aria-hidden />
              Open chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {booking.dispute && (
        <Card className="border-orange-200">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Scale className="size-4 text-orange-600" aria-hidden />
            <CardTitle className="text-lg">Dispute</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <p className="font-medium">Filed by</p>
              <p className="text-muted-foreground">{booking.dispute.filedBy.name}</p>
            </div>
            <div>
              <p className="font-medium">Reason</p>
              <p className="text-muted-foreground whitespace-pre-line">
                {booking.dispute.reason}
              </p>
            </div>
            {booking.dispute.status === "resolved" && (
              <div className="mt-1 rounded-md bg-green-50 p-3">
                <p className="font-medium text-green-700">
                  Resolved —{" "}
                  {booking.dispute.resolution === "refund_buyer"
                    ? "refunded the buyer"
                    : "paid the provider"}
                </p>
                {booking.dispute.adminNote && (
                  <p className="mt-1 text-muted-foreground">
                    {booking.dispute.adminNote}
                  </p>
                )}
              </div>
            )}
            {booking.dispute.status === "open" && (
              <p className="mt-1 text-sm text-muted-foreground">
                This dispute is waiting for an admin to review it.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {canAccept && <AcceptBookingButton bookingId={booking.id} />}
            {canCheckIn && <CheckInForm bookingId={booking.id} />}
            {canCheckOut && <CheckOutForm bookingId={booking.id} />}
            {canRelease && (
              <ReleasePaymentForm
                bookingId={booking.id}
                providerName={booking.provider.user.name}
              />
            )}
            {canCancel && <CancelBookingButton bookingId={booking.id} />}
            {canProviderCancel && <CancelProviderButton bookingId={booking.id} />}
            {canDispute && <FileDisputeButton bookingId={booking.id} />}

            {!canAccept && !canCheckIn && !canCheckOut && !canRelease && !canCancel && !canProviderCancel && !canDispute && (
              <p className="text-sm text-muted-foreground">
                No actions available right now.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {photoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <img
            src={photoPreview}
            alt="Preview"
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
