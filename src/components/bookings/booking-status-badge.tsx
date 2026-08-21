import { Badge } from "@/components/ui/badge";
import {
  STATUS_BADGE_CLASSES,
  STATUS_BADGE_LABELS,
  type BookingStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BookingStatusBadge({ status }: { status: string }) {
  const value = status as BookingStatus;
  return (
    <Badge className={cn(STATUS_BADGE_CLASSES[value], "border-transparent")}>
      {STATUS_BADGE_LABELS[value] ?? value}
    </Badge>
  );
}
