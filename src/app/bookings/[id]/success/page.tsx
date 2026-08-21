import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, CalendarDays, Clock, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryLabel } from "@/lib/constants";
import { formatCredits, formatDate, durationLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Booking confirmed" };

export default async function BookingSuccessPage({
  params,
}: PageProps<"/bookings/[id]/success">) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      provider: { include: { user: { select: { name: true } } } },
    },
  });

  if (!booking || booking.buyerId !== session.user.id) notFound();

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="size-8" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-2xl">Booking confirmed!</CardTitle>
            <CardDescription>
              Your credits are now held in escrow until the job is done.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-mono text-xs">{booking.id}</span>
            </div>
            <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">
                {booking.provider.user.name}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({categoryLabel(booking.provider.category)})
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                {formatDate(booking.date)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="size-4 text-muted-foreground" aria-hidden />
                {durationLabel(booking.duration)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted-foreground">Credits held in escrow</span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Sparkles className="size-4 text-primary" aria-hidden />
                {formatCredits(booking.totalCredits)} credits
              </span>
            </div>
          </div>

          <Separator />

          <Button className="w-full" size="lg" render={<Link href="/bookings" />}>
            View My Bookings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}