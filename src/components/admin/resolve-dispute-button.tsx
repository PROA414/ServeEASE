"use client";

import { useState } from "react";
import { toast } from "sonner";
import { resolveDispute } from "@/app/actions/admin";
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

type ResolveDisputeButtonProps = {
  disputeId: string;
  buyerName: string;
  providerName: string;
  onResolved: (decision: "refund_buyer" | "pay_provider") => void;
};

export function ResolveDisputeButton({
  disputeId,
  buyerName,
  providerName,
  onResolved,
}: ResolveDisputeButtonProps) {
  const [open, setOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleResolve = async (decision: "refund_buyer" | "pay_provider") => {
    setSubmitting(true);
    const result = await resolveDispute(disputeId, decision, adminNote);

    if (result.success) {
      toast.success(
        decision === "refund_buyer"
          ? `Refunded ${buyerName}.`
          : `Paid ${providerName}.`
      );
      setOpen(false);
      setAdminNote("");
      onResolved(decision);
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Scale className="size-4" aria-hidden />
        Resolve
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve dispute</DialogTitle>
            <DialogDescription>
              Decide in favor of {buyerName} (refund the held credits) or{" "}
              {providerName} (pay out the credits).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Textarea
              placeholder="Admin note (optional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
            />
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleResolve("refund_buyer")}
                disabled={submitting}
              >
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Refund buyer
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleResolve("pay_provider")}
                disabled={submitting}
              >
                Pay provider
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}