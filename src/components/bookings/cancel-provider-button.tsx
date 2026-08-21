"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cancelBookingByProvider } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export function CancelProviderButton({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    setSubmitting(true);
    const result = await cancelBookingByProvider(bookingId);

    if (result.success) {
      toast.success("Booking cancelled. The buyer has been refunded.");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Button variant="destructive" className="w-full" onClick={() => setOpen(true)}>
        Cancel booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              The buyer&apos;s credits will be refunded and the date will be freed. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
