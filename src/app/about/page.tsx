import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about SearveEASE and how we connect families with trusted home service providers.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About SearveEASE</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          SearveEASE connects busy families with trusted, verified home service
          providers — cleaners, nannies, cooks and handymen — with a booking
          process that&apos;s simple, secure and stress-free.
        </p>
      </div>

      <section className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          We started SearveEASE because finding reliable help for your home
          shouldn&apos;t be a gamble. Traditional approaches rely on word of mouth,
          cash handoffs and phone tag — we built a platform where every provider
          is verified, every booking is tracked, and every payment is protected
          by secure escrow.
        </p>
        <p>
          With credits, escrow protection, in-app chat and dispute resolution,
          both sides can work together with confidence. Ratings and reviews from
          real bookings help every family choose the right provider.
        </p>
      </section>

      <div className="rounded-2xl border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold">Our promise</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>• Verified, vetted providers</li>
          <li>• Payments held in secure escrow</li>
          <li>• Transparent pricing in credits</li>
          <li>• Fast, fair dispute resolution</li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Ready to get started?{" "}
        <Link href="/how-it-works" className="font-medium text-primary underline-offset-4 hover:underline">
          See how it works
        </Link>{" "}
        or{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          create an account
        </Link>
        .
      </p>
    </div>
  );
}