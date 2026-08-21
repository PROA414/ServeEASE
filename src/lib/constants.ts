export const CATEGORIES = [
  { value: "cleaner", label: "Cleaner" },
  { value: "nanny", label: "Nanny" },
  { value: "cook", label: "Cook" },
  { value: "handyman", label: "Handyman" },
] as const;

export type ServiceCategory = (typeof CATEGORIES)[number]["value"];

export const DURATIONS = [
  {
    value: "full",
    label: "Full Day",
    hours: "8 hours",
    description: "Standard full-day shift",
  },
  {
    value: "half",
    label: "Half Day",
    hours: "4 hours",
    description: "Morning or afternoon",
  },
] as const;

export type Duration = (typeof DURATIONS)[number]["value"];

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "released",
  "disputed",
  "cancelled",
  "refunded",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const UPCOMING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
];

export const PAST_STATUSES: BookingStatus[] = [
  "completed",
  "released",
  "cancelled",
  "disputed",
  "refunded",
];

export const STATUS_BADGE_VARIANTS: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  in_progress: "default",
  completed: "outline",
  released: "default",
  disputed: "destructive",
  cancelled: "destructive",
  refunded: "outline",
};

export const STATUS_BADGE_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  released: "Released",
  disputed: "Disputed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const STATUS_BADGE_CLASSES: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  in_progress: "bg-green-100 text-green-800 hover:bg-green-100",
  completed: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  released: "bg-green-100 text-green-800 hover:bg-green-100",
  disputed: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  refunded: "bg-zinc-100 text-zinc-600 hover:bg-zinc-100",
};

export const categoryLabel = (value: string): string => {
  const found = CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value.charAt(0).toUpperCase() + value.slice(1);
};
