import Link from "next/link";
import { Sparkles, ShieldCheck, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="hidden flex-col gap-6 lg:flex">
          <Link href="/" className="flex w-fit items-center gap-2.5 font-semibold">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <span className="text-lg">SearveEASE</span>
          </Link>
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Trusted help for your home, without the hassle.
          </h2>
          <p className="text-muted-foreground">
            Book verified cleaners, nannies, cooks and handymen — pay securely
            with credits held in escrow until you&apos;re happy.
          </p>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              Payments protected by secure escrow
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="size-4 text-primary" aria-hidden />
              4.8 average provider rating
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="size-4 text-primary" aria-hidden />
              Join 2,000+ users
            </span>
          </div>
        </div>
        <div className={cn("flex flex-col items-center", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}