import Link from "next/link";
import { CalendarDays, BriefcaseBusiness, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { StarRating } from "@/components/providers/star-rating";
import { categoryLabel } from "@/lib/constants";
import { formatCredits } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ProviderCardData = {
  id: string;
  category: string;
  dailyRate: number;
  halfDayRate: number;
  rating: number;
  totalBookings: number;
  verified: boolean;
  user: { name: string; image: string | null };
  latestReview?: { comment: string; reviewerName: string } | null;
};

export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          {provider.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.user.image}
              alt={provider.user.name}
              className="size-12 rounded-full object-cover"
            />
          ) : (
            <UserRound className="size-6 text-primary" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{provider.user.name}</h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{categoryLabel(provider.category)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <StarRating rating={provider.rating} />
          <span className="text-sm text-muted-foreground">
            {provider.rating.toFixed(1)}
          </span>
        </div>
        {provider.latestReview ? (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              “{provider.latestReview.comment}”
            </p>
            <p className="mt-1 text-xs font-medium text-foreground/80">
              — {provider.latestReview.reviewerName}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Full day</p>
            <p className="font-semibold">{formatCredits(provider.dailyRate)} cr</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Half day</p>
            <p className="font-semibold">{formatCredits(provider.halfDayRate)} cr</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-4" aria-hidden />
            {provider.totalBookings} bookings
          </span>
          {provider.verified && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-green-600"
              )}
            >
              <BriefcaseBusiness className="size-4" aria-hidden />
              Verified
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button render={<Link href={`/providers/${provider.id}`} />} className="flex-1">
          View Profile
        </Button>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/providers/${provider.id}#reviews`} />}
          className="text-muted-foreground"
        >
          Read reviews
        </Button>
      </CardFooter>
    </Card>
  );
}