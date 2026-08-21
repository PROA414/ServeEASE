"use client";

import { useState } from "react";
import { toast } from "sonner";
import { acceptBooking } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCheck } from "lucide-react";

type AcceptBookingButtonProps = {
  bookingId: string;
};

export function AcceptBookingButton({ bookingId }: AcceptBookingButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    setSubmitting(true);
    const result = await acceptBooking(bookingId);

    if (result.success) {
      toast.success("Booking accepted. The buyer has been notified.");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <CheckCheck className="size-4" aria-hidden />
        Accept Booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept booking</DialogTitle>
            <DialogDescription>
              Confirm that you&apos;ll take this job. The buyer will see it as
              confirmed. Are you sure?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Not yet
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Yes, accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}