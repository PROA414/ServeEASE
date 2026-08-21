const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const formatDate = (date: Date | string): string =>
  dateFormatter.format(new Date(date));

export const formatShortDate = (date: Date | string): string =>
  shortDateFormatter.format(new Date(date));

export const formatCredits = (credits: number): string =>
  new Intl.NumberFormat("en-US").format(credits);

export const durationLabel = (duration: string): string =>
  duration === "full" ? "Full Day" : "Half Day";
