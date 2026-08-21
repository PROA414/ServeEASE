"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cancelBooking } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type CancelBookingButtonProps = {
  bookingId: string;
};

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    setSubmitting(true);
    const result = await cancelBooking(bookingId);

    if (result.success) {
      toast.success("Booking cancelled. Credits returned to your wallet.");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Button variant="destructive" className="w-full" onClick={() => setOpen(true)}>
        Cancel Booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
            <DialogDescription>
              This will cancel your booking and return the held credits to your
              wallet. Are you sure?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Keep booking
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancel}
              disabled={submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Yes, cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
