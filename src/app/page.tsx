import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, CalendarClock, Users, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRating } from "@/components/providers/star-rating";

const TESTIMONIALS = [
  {
    quote:
      "SearveEASE made it so easy to find a cleaner for our home. Maria was punctual, thorough, and the escrow payment meant we never worried about cash.",
    name: "Amina O.",
    role: "Buyer, Lagos",
    rating: 5,
  },
  {
    quote:
      "As a busy working parent, booking a nanny through the app saved me hours. The chat feature let me coordinate everything ahead of time.",
    name: "Chidi N.",
    role: "Buyer, Abuja",
    rating: 5,
  },
  {
    quote:
      "I get paid on time, every time. The credits system is transparent and the dispute process is fair. It's transformed how I manage my clients.",
    name: "Grace O.",
    role: "Provider, nanny",
    rating: 5,
  },
  {
    quote:
      "Being able to compare rates, check ratings, and read reviews before booking gave me real confidence. Highly recommend for first-time users.",
    name: "Tunde A.",
    role: "Buyer, Ibadan",
    rating: 4,
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-32">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-20">
            <Sparkles className="size-8 sm:size-10" aria-hidden />
          </span>
          <div className="flex max-w-3xl flex-col items-center gap-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find trusted help, instantly.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Book cleaners, nannies, cooks, and handymen with credits. Simple,
              secure, and stress-free — because your time matters.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/providers" />} className="gap-2">
                Browse providers
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/become-provider" />}
              >
                Become a provider
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              Secure escrow
            </span>
            <span className="flex items-center gap-2">
              <Star className="size-4 text-primary" aria-hidden />
              Verified ratings
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 text-primary" aria-hidden />
              {100}+ providers
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="size-5 text-primary" aria-hidden />
                Book in seconds
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Pick a provider, choose a date and duration, and confirm. No phone
              calls required.
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-5 text-primary" aria-hidden />
                Escrow protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Credits are held safely until you release them after the job is
              done.
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="size-5 text-primary" aria-hidden />
                Verified providers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Every provider is rated by the community. Read reviews before you
              book.
            </CardContent>
          </Card>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-5 text-primary" aria-hidden />
                Chat directly
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Message providers in-app to share details, ask questions, and stay
              aligned.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            From browsing to paying, we make it effortless in three steps.
          </p>
          <div className="grid w-full gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Browse", text: "Find verified providers near you." },
              { step: "2", title: "Book", text: "Pick a date, duration and pay with credits." },
              { step: "3", title: "Pay", text: "Release payment securely once the job is done." },
            ].map((s) => (
              <div
                key={s.step}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                  {s.step}
                </span>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="lg"
            render={<Link href="/how-it-works" />}
            className="gap-2"
          >
            Learn more
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Join thousands of users who trust SearveEASE to connect with reliable
            service providers.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/signup" />} className="gap-2">
              Create free account
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              render={<Link href="/providers" />}
            >
              Explore providers
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by families & providers
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Real stories from people who trust SearveEASE every day.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="flex flex-col gap-4">
              <CardContent className="flex flex-1 flex-col gap-4 pt-(--card-spacing)">
                <Quote className="size-6 text-primary/40" aria-hidden />
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{t.quote}”
                </p>
                <div className="flex flex-col gap-1 border-t pt-4">
                  <StarRating rating={t.rating} />
                  <p className="mt-1 text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Join{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            thousands of users
          </Link>{" "}
          booking trusted help today.
        </p>
      </section>
    </div>
  );
}
