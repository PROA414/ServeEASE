"use client";

import { useState } from "react";
import { toast } from "sonner";
import { checkOut } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Camera } from "lucide-react";

type CheckOutFormProps = {
  bookingId: string;
};

export function CheckOutForm({ bookingId }: CheckOutFormProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      const data = (await res.json()) as { url: string };
      setPhotoUrl(data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      () => {
        setLocationError("Unable to retrieve your location.");
      }
    );
  };

  const handleSubmit = async () => {
    if (!photoUrl) {
      toast.error("Please take or upload a photo.");
      return;
    }
    if (!location) {
      toast.error("Please capture your location.");
      return;
    }

    setSubmitting(true);
    const result = await checkOut(bookingId, {
      lat: location.lat,
      lng: location.lng,
      photo: photoUrl,
    });

    if (result.success) {
      toast.success("Job completed. Waiting for payment release.");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Check Out
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check out</DialogTitle>
            <DialogDescription>
              Capture a final photo and location to complete the job.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Photo</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground hover:border-foreground/40">
                <Camera className="size-4" aria-hidden />
                {uploading ? "Uploading..." : photoUrl ? "Change photo" : "Take or upload a photo"}
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              {photoUrl && (
                <img src={photoUrl} alt="Check-out preview" className="size-full max-h-48 rounded-lg object-cover" />
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Location</label>
              <Button
                type="button"
                variant="outline"
                onClick={captureLocation}
                disabled={Boolean(location)}
              >
                <MapPin className="size-4" aria-hidden />
                {location ? "Location captured" : "Capture location"}
              </Button>
              {locationError && (
                <p className="text-xs text-destructive">{locationError}</p>
              )}
              {location && (
                <p className="text-xs text-muted-foreground">
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !photoUrl || !location}
              className="w-full"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Confirm check-out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
