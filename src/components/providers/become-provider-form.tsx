"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { becomeProvider } from "@/app/actions/providers";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const becomeProviderClientSchema = z.object({
  category: z.string().min(1, "Choose a category"),
  dailyRate: z.coerce.number().int().min(1, "Daily rate must be at least 1"),
  halfDayRate: z.coerce
    .number()
    .int()
    .min(1, "Half-day rate must be at least 1"),
  bio: z
    .string()
    .max(1000, "Bio must be under 1000 characters")
    .optional()
    .or(z.literal("")),
  experience: z
    .string()
    .max(500, "Experience must be under 500 characters")
    .optional()
    .or(z.literal("")),
});

type BecomeProviderValues = z.infer<typeof becomeProviderClientSchema>;

export function BecomeProviderForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<BecomeProviderValues>({
    resolver: zodResolver(becomeProviderClientSchema),
    defaultValues: {
      category: "",
      dailyRate: undefined,
      halfDayRate: undefined,
      bio: "",
      experience: "",
    },
  });

  const onSubmit = async (values: BecomeProviderValues) => {
    setPending(true);
    const result = await becomeProvider(values);

    if (result.success) {
      toast.success("Provider profile created!");
      router.push("/providers");
      router.refresh();
    } else {
      toast.error(result.error);
      setPending(false);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Become a provider</CardTitle>
        <CardDescription>
          Set your rates and services so buyers can book you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      name="category"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily rate (credits)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="120"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="halfDayRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Half-day rate (credits)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="70"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell buyers about yourself and your services."
                      className="min-h-24 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. 5 years in professional cleaning"
                      className="min-h-20 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating profile..." : "Create provider profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
