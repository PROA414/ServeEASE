import { Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PAST_STATUSES, UPCOMING_STATUSES } from "@/lib/constants";
import { formatCredits } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingsTabs } from "@/components/bookings/bookings-tabs";
import { AvailabilityEditor } from "@/components/providers/availability-editor";

export async function ProviderDashboard({
  userId,
  providerId,
}: {
  userId: string;
  providerId: string;
}) {
  const [earningsResult, providerBookings, provider] = await Promise.all([
    prisma.creditTransaction.aggregate({
      where: { userId, type: "payout" },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      where: { providerId },
      include: {
        buyer: { select: { id: true, name: true, image: true } },
        provider: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { availableDays: true },
    }),
  ]);

  const earnings = earningsResult._sum.amount ?? 0;
  const upcoming = providerBookings.filter((b) =>
    UPCOMING_STATUSES.includes(b.status as (typeof UPCOMING_STATUSES)[number])
  );
  const past = providerBookings.filter((b) =>
    PAST_STATUSES.includes(b.status as (typeof PAST_STATUSES)[number])
  );
  const availableDays = provider?.availableDays
    ? provider.availableDays
        .split(",")
        .map((d) => Number(d))
        .filter((d) => Number.isInteger(d))
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Provider overview</h2>
        <Button variant="outline" size="sm" render={<Link href="/providers" />}>
          View my provider profile
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total earnings
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-2xl font-bold">
              <Sparkles className="size-5 text-primary" aria-hidden />
              {formatCredits(earnings)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{past.length}</p>
          </CardContent>
        </Card>
      </div>

      <AvailabilityEditor providerId={providerId} availableDays={availableDays} />

      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Provider bookings</h3>
        <BookingsTabs upcoming={upcoming} past={past} viewerId={userId} />
      </div>
    </div>
  );
}