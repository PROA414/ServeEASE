"use client";

import { useState } from "react";
import { toast } from "sonner";
import { fileDispute } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Scale } from "lucide-react";

type FileDisputeButtonProps = {
  bookingId: string;
};

export function FileDisputeButton({ bookingId }: FileDisputeButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please describe why you're filing a dispute.");
      return;
    }

    setSubmitting(true);
    const result = await fileDispute(bookingId, reason);

    if (result.success) {
      toast.success("Dispute filed. An admin will review it.");
      setOpen(false);
      setReason("");
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Scale className="size-4" aria-hidden />
        File a dispute
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File a dispute</DialogTitle>
            <DialogDescription>
              Tell us what went wrong with this booking. An admin will review
              your dispute and decide how to resolve it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Textarea
              placeholder="Describe the issue…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Submit dispute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}