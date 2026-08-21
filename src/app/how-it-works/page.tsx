import type { Metadata } from "next";
import Link from "next/link";
import { Search, CalendarCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Book trusted home service providers in three simple steps with SearveEASE.",
};

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Browse providers",
    description:
      "Search cleaners, nannies, cooks and handymen by category, rating or price. Compare verified providers and read reviews before you decide.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book & pay with credits",
    description:
      "Pick a date and duration, then confirm your booking. Credits are held in secure escrow — your provider isn't paid until the job is done.",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Release payment",
    description:
      "Your provider completes the job, checks out, and you release the payment once you're happy. Leave a rating to help the community.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How SearveEASE works
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          Get trusted help in three simple steps — no phone calls, no cash
          handoffs, no stress.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.number} className="relative flex flex-col">
            <CardHeader>
              <span className="text-4xl font-bold text-primary/15">
                {step.number}
              </span>
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-6" aria-hidden />
              </span>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {step.description}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-muted/30 p-8 text-center">
        <h2 className="text-xl font-semibold">Ready to get started?</h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          Create a free account, top up your credits, and book your first
          provider in minutes.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/signup" />}>Create free account</Button>
          <Button variant="outline" render={<Link href="/providers" />}>
            Browse providers
          </Button>
        </div>
      </div>
    </div>
  );
}