"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createBooking } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DURATIONS } from "@/lib/constants";
import { formatCredits, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  date: z.date({ message: "Please pick a date" }),
  duration: z.enum(["full", "half"], { message: "Choose a duration" }),
  specialInstructions: z
    .string()
    .max(500, "Instructions must be under 500 characters")
    .optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

type BookingFormProps = {
  providerId: string;
  dailyRate: number;
  halfDayRate: number;
  isAuthenticated: boolean;
  availableDays?: number[] | null;
  bookedDates?: string[];
};

export function BookingForm({
  providerId,
  dailyRate,
  halfDayRate,
  isAuthenticated,
  availableDays = null,
  bookedDates = [],
}: BookingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: undefined,
      duration: undefined,
      specialInstructions: "",
    },
  });

  const duration = useWatch({ control: form.control, name: "duration" });

  const totalCredits = useMemo(() => {
    if (!duration) return null;
    return duration === "full" ? dailyRate : halfDayRate;
  }, [duration, dailyRate, halfDayRate]);

  const onSubmit = async (values: BookingValues) => {
    if (!isAuthenticated) {
      toast.error("Please log in to book a provider.");
      router.push(`/login?next=/providers/${providerId}`);
      return;
    }

    setSubmitting(true);
    const result = await createBooking({
      providerId,
      date: values.date,
      duration: values.duration,
      specialInstructions: values.specialInstructions || "",
    });

    if (result.success) {
      toast.success("Booking confirmed! Credits are now in escrow.");
      router.push(`/bookings/${result.bookingId}/success`);
      router.refresh();
    } else {
      toast.error(result.error);
      setSubmitting(false);
    }
  };

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (availableDays && availableDays.length > 0) {
      if (!availableDays.includes(date.getDay())) return true;
    }

    const key = date.toISOString().slice(0, 10);
    return bookedDates.includes(key);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6" noValidate>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" type="button" className="w-full justify-start text-left font-normal">
                      {field.value ? (
                        formatDate(field.value)
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto size-4 opacity-50" aria-hidden />
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => field.onChange(date)}
                    disabled={disabledDays}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {DURATIONS.map((option) => {
                    const selected = field.value === option.value;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors",
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-foreground/30"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <RadioGroupItem value={option.value} />
                          <span className="font-medium">{option.label}</span>
                        </span>
                        <span className="pl-6 text-sm text-muted-foreground">
                          {option.hours}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Special instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Anything the provider should know (optional)"
                  className="min-h-24 resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-right text-xs">
                {field.value?.length ?? 0}/500
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="flex items-center gap-1 font-semibold">
              {totalCredits !== null ? (
                <>
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  {formatCredits(totalCredits)} credits
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Credits are held in escrow until you release them after the job.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Booking...
            </>
          ) : totalCredits !== null ? (
            `Book Now — ${formatCredits(totalCredits)} Credits`
          ) : (
            "Book Now"
          )}
        </Button>
      </form>
    </Form>
  );
}