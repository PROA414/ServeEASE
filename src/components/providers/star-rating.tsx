import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalf = rounded - fullStars >= 0.5;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className="size-3.5 fill-yellow-400 text-yellow-400"
              aria-hidden
            />
          );
        }
        if (i === fullStars && hasHalf) {
          return (
            <span key={i} className="relative inline-flex">
              <Star className="size-3.5 text-yellow-400" aria-hidden />
              <StarHalf className="absolute inset-0 size-3.5 fill-yellow-400 text-yellow-400" aria-hidden />
            </span>
          );
        }
        return (
          <Star key={i} className="size-3.5 text-muted-foreground/30" aria-hidden />
        );
      })}
    </div>
  );
}