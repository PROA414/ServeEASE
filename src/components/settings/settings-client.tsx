"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Check, Loader2, Monitor, Moon, Sun } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { updateNotificationPreferences } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function SettingsClient({
  name,
  email,
  initialNotifyBookings,
  initialNotifyMessages,
}: {
  name: string;
  email: string;
  initialNotifyBookings: boolean;
  initialNotifyMessages: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [pending, setPending] = React.useState(false);
  const [notifyBooking, setNotifyBooking] = React.useState(initialNotifyBookings);
  const [notifyMessages, setNotifyMessages] = React.useState(initialNotifyMessages);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const newName = String(formData.get("name") ?? "").trim();

    try {
      if (!newName) {
        toast.error("Name is required");
        return;
      }
      const { error } = await authClient.updateUser({
        name: newName,
      });
      if (error) {
        toast.error(error.message ?? "Failed to update profile");
      } else {
        toast.success("Profile updated");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
          <CardDescription>
            Update your name and account details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={name}
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address.
              </p>
            </div>
            <Button type="submit" className="w-fit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how SearveEASE looks for you.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const active = (theme ?? "system") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
                aria-pressed={active}
              >
                <option.icon className="size-5" aria-hidden />
                {option.label}
                {active ? (
                  <Check className="size-4 text-primary" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>
            Choose which updates you want to receive by email.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <span>
              <span className="block text-sm font-medium">Booking updates</span>
              <span className="block text-sm text-muted-foreground">
                Confirmation, cancellation and payment notifications.
              </span>
            </span>
            <input
              type="checkbox"
              checked={notifyBooking}
              onChange={async (e) => {
                const next = e.target.checked;
                setNotifyBooking(next);
                const result = await updateNotificationPreferences({ notifyBookings: next });
                if (!result.success) {
                  setNotifyBooking(!next);
                  toast.error(result.error);
                }
              }}
              className="size-4 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <span>
              <span className="block text-sm font-medium">New messages</span>
              <span className="block text-sm text-muted-foreground">
                Notify me when I receive a new message.
              </span>
            </span>
            <input
              type="checkbox"
              checked={notifyMessages}
              onChange={async (e) => {
                const next = e.target.checked;
                setNotifyMessages(next);
                const result = await updateNotificationPreferences({ notifyMessages: next });
                if (!result.success) {
                  setNotifyMessages(!next);
                  toast.error(result.error);
                }
              }}
              className="size-4 accent-primary"
            />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}