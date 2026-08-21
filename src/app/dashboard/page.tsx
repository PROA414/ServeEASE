import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Wallet, CalendarCheck, TrendingUp, ArrowRight, PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PAST_STATUSES, UPCOMING_STATUSES } from "@/lib/constants";
import { formatCredits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";
import { ProviderDashboard } from "@/components/dashboard/provider-dashboard";
import { OnboardingChecklist } from "@/components/onboarding-checklist";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?next=/dashboard");

  const userId = session.user.id;

  const [balanceResult, bookings, providerProfile] = await Promise.all([
    prisma.creditTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      where: { buyerId: userId },
      include: {
        provider: {
          include: { user: { select: { name: true, image: true } } },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.serviceProvider.findUnique({ where: { userId } }),
  ]);

  const balance = balanceResult._sum.amount ?? 0;
  const upcoming = bookings.filter((b) =>
    UPCOMING_STATUSES.includes(b.status as (typeof UPCOMING_STATUSES)[number])
  );
  const past = bookings.filter((b) =>
    PAST_STATUSES.includes(b.status as (typeof PAST_STATUSES)[number])
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name.split(" ")[0]}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button render={<Link href="/providers" />} className="gap-2">
            <CalendarCheck className="size-4" aria-hidden />
            Book now
          </Button>
          <Button
            variant="outline"
            render={<Link href="/wallet" />}
            className="gap-2"
          >
            <PlusCircle className="size-4" aria-hidden />
            Buy credits
          </Button>
        </div>
      </div>

      <OnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit balance
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-4" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-2xl font-bold">
              <Sparkles className="size-5 text-primary" aria-hidden />
              {formatCredits(balance)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5 text-green-600" aria-hidden />
              Available to spend on your next booking
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active bookings
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <CalendarCheck className="size-4" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pending, confirmed or in progress
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total bookings
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <Sparkles className="size-4" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookings.length}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              Lifetime bookings
              <Link
                href="/bookings"
                className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline"
              >
                View all
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {providerProfile ? (
        <ProviderDashboard userId={userId} providerId={providerProfile.id} />
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">My Bookings</h2>
        <BookingsTabs upcoming={upcoming} past={past} />
      </div>
    </div>
  );
}