"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateAvailability } from "@/app/actions/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

type AvailabilityEditorProps = {
  providerId: string;
  availableDays: number[] | null;
};

export function AvailabilityEditor({
  providerId,
  availableDays,
}: AvailabilityEditorProps) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(availableDays ?? [])
  );
  const [saving, setSaving] = useState(false);

  const toggle = (day: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateAvailability(providerId, [...selected]);

    if (result.success) {
      toast.success(
        selected.size === 0
          ? "Availability updated — you're now available any day."
          : "Availability updated."
      );
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly availability</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          Pick the days you&apos;re available to take jobs. Clients can only book you
          on these days. Select none to be available any day.
        </p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const isSelected = selected.has(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggle(day.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Save availability
        </Button>
      </CardContent>
    </Card>
  );
}