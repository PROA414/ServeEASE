"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, PartyPopper, UserRound, Search, CalendarCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    key: "profile",
    title: "Complete your profile",
    description: "Add a photo and your details.",
    href: "/settings",
    icon: UserRound,
  },
  {
    key: "browse",
    title: "Browse providers",
    description: "Explore trusted providers near you.",
    href: "/providers",
    icon: Search,
  },
  {
    key: "first_booking",
    title: "Make your first booking",
    description: "Book a provider you like.",
    href: "/providers",
    icon: CalendarCheck,
  },
] as const;

const STORAGE_KEY = "searveease:onboarding";

type OnboardingState = Record<(typeof STEPS)[number]["key"], boolean>;

function loadState(): OnboardingState {
  if (typeof window === "undefined") {
    return { profile: false, browse: false, first_booking: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OnboardingState>;
      return { profile: !!parsed.profile, browse: !!parsed.browse, first_booking: !!parsed.first_booking };
    }
  } catch {
    // ignore malformed storage
  }
  return { profile: false, browse: false, first_booking: false };
}

export function OnboardingChecklist() {
  const [state, setState] = React.useState<OnboardingState>(loadState);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    try {
      if (dismissed) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // ignore storage errors
    }
  }, [state, dismissed]);

  const completedCount = STEPS.filter((s) => state[s.key]).length;
  const allDone = completedCount === STEPS.length;

  if (dismissed || allDone) {
    return null;
  }

  const markDone = (key: (typeof STEPS)[number]["key"]) => {
    setState((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {allDone ? (
            <PartyPopper className="size-5 text-primary" aria-hidden />
          ) : (
            <CheckCircle2 className="size-5 text-primary" aria-hidden />
          )}
          Get started
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss onboarding checklist"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          {completedCount} of {STEPS.length} steps complete
        </p>
        <div className="flex gap-1">
          {STEPS.map((s) => (
            <span
              key={s.key}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                state[s.key] ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        {STEPS.map((step) => {
          const done = state[step.key];
          return (
            <div
              key={step.key}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3",
                done ? "border-transparent bg-muted/40" : "bg-background"
              )}
            >
              <span className="mt-0.5">
                {done ? (
                  <CheckCircle2 className="size-5 text-green-600" aria-hidden />
                ) : (
                  <Circle className="size-5 text-muted-foreground/50" aria-hidden />
                )}
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <p className={cn("text-sm font-medium", done && "text-muted-foreground line-through")}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {done ? null : (
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={step.href} />}
                  onClick={() => markDone(step.key)}
                >
                  Start
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}