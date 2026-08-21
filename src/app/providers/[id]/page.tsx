import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryLabel } from "@/lib/constants";
import { formatCredits, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/providers/star-rating";
import { BookingForm } from "@/components/bookings/booking-form";
import { parseAvailableDays, availableDaysLabel } from "@/lib/availability";

export async function generateMetadata({
  params,
}: PageProps<"/providers/[id]">): Promise<Metadata> {
  const { id } = await params;
  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!provider) return { title: "Provider not found" };

  return { title: `${provider.user.name} — ${categoryLabel(provider.category)}` };
}

export default async function ProviderDetailPage({
  params,
}: PageProps<"/providers/[id]">) {
  const { id } = await params;
  const session = await getSession();

  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!provider) notFound();

  const [reviews, activeBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        providerId: id,
        status: "released",
        comment: { not: null },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { buyer: { select: { name: true } } },
    }),
    prisma.booking.findMany({
      where: {
        providerId: id,
        status: { in: ["pending", "confirmed", "in_progress"] },
      },
      select: { date: true },
    }),
  ]);

  const isOwnProfile = session?.user?.id === provider.userId;

  const bookedDates = activeBookings.map((b) => b.date.toISOString().slice(0, 10));
  const availableDays = parseAvailableDays(provider.availableDays);

  const availabilityLabel = availableDaysLabel(provider.availableDays);

  return (
    <div className="grid flex-1 gap-8 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-20">
              {provider.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={provider.user.image}
                  alt={provider.user.name}
                  className="size-16 rounded-full object-cover sm:size-20"
                />
              ) : (
                <UserRound className="size-8 text-primary sm:size-10" aria-hidden />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {provider.user.name}
                </h1>
                <Badge variant="secondary">{categoryLabel(provider.category)}</Badge>
                {provider.verified && (
                  <Badge variant="outline" className="gap-1 text-green-700">
                    <CheckCircle2 className="size-3" aria-hidden />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <StarRating rating={provider.rating} />
                  <span className="text-muted-foreground">
                    {provider.rating.toFixed(1)}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {provider.totalBookings} bookings completed
                </span>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Full day
                  </p>
                  <p className="font-semibold">
                    {formatCredits(provider.dailyRate)} credits
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Half day
                  </p>
                  <p className="font-semibold">
                    {formatCredits(provider.halfDayRate)} credits
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Available
                  </p>
                  <p className="font-semibold">{availabilityLabel}</p>
                </div>
                {provider.experience && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Experience
                    </p>
                    <p className="font-semibold">{provider.experience}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {provider.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {provider.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {reviews.length > 0 && (
          <Card id="reviews">
            <CardHeader>
              <CardTitle className="text-lg">Reviews</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {reviews.map((booking) => (
                <div key={booking.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                        <UserRound className="size-4 text-primary" aria-hidden />
                      </span>
                      <span className="text-sm font-medium">
                        {booking.buyer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.rating != null && (
                        <StarRating rating={booking.rating} />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(booking.date)}
                      </span>
                    </div>
                  </div>
                  {booking.comment ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      “{booking.comment}”
                    </p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Book {provider.user.name.split(" ")[0]}</CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="mb-6" />
            {isOwnProfile ? (
              <p className="text-sm text-muted-foreground">
                This is your provider profile. You can&apos;t book yourself.
              </p>
            ) : (
              <BookingForm
                providerId={provider.id}
                dailyRate={provider.dailyRate}
                halfDayRate={provider.halfDayRate}
                isAuthenticated={Boolean(session?.user)}
                availableDays={availableDays}
                bookedDates={bookedDates}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}