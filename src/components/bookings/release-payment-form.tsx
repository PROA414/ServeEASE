"use client";

import { useState } from "react";
import { toast } from "sonner";
import { releasePayment } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";

type ReleasePaymentFormProps = {
  bookingId: string;
  providerName: string;
};

export function ReleasePaymentForm({
  bookingId,
  providerName,
}: ReleasePaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const router = useRouter();

  const handleRelease = async () => {
    setSubmitting(true);
    const result = await releasePayment(bookingId);

    if (result.success) {
      toast.success("Payment released to provider.");
      setOpen(false);
      setShowRating(true);
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  const handleRatingSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit rating");
      }

      toast.success("Thanks for your feedback!");
      setShowRating(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Release Payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release payment</DialogTitle>
            <DialogDescription>
              This will transfer {providerName}&apos;s payment from escrow to their
              balance. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Button
              onClick={handleRelease}
              disabled={submitting}
              className="w-full"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Confirm release
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate your experience</DialogTitle>
            <DialogDescription>
              How was working with {providerName}?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded-full p-1 transition-colors hover:bg-accent"
                >
                  <Star
                    className="size-8"
                    aria-hidden
                    style={{
                      fill: value <= rating ? "currentColor" : "none",
                      color: value <= rating ? "#f59e0b" : "currentColor",
                    }}
                  />
                </button>
              ))}
            </div>

            <textarea
              className="min-h-24 w-full rounded-lg border bg-transparent p-3 text-sm"
              placeholder="Leave an optional comment..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />

            <Button
              onClick={handleRatingSubmit}
              disabled={submitting || rating === 0}
              className="w-full"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Submit rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
