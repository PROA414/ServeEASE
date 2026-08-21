export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseAvailableDays(value: string | null): number[] | null {
  if (!value) return null;
  const days = value
    .split(",")
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  return days.length > 0 ? days : null;
}

export function availableDaysLabel(value: string | null): string {
  const days = parseAvailableDays(value);
  if (!days) return "Every day";
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAYS[d])
    .join(", ");
}