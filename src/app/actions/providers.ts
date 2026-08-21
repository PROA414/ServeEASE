"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";

const becomeProviderSchema = z.object({
  category: z.enum(CATEGORIES.map((c) => c.value) as [string, ...string[]], {
    message: "Choose a category",
  }),
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

export type BecomeProviderInput = z.infer<typeof becomeProviderSchema>;

export type BecomeProviderResult =
  | { success: true }
  | { success: false; error: string };

export async function becomeProvider(
  input: BecomeProviderInput
): Promise<BecomeProviderResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = becomeProviderSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid details.";
    return { success: false, error: message };
  }

  const { category, dailyRate, halfDayRate, bio, experience } = parsed.data;

  const existing = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (existing) {
    return {
      success: false,
      error: "You already have a provider profile.",
    };
  }

  await prisma.serviceProvider.create({
    data: {
      userId: session.user.id,
      category,
      dailyRate,
      halfDayRate,
      bio: bio || null,
      experience: experience || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/providers");

  return { success: true };
}

export type UpdateAvailabilityResult =
  | { success: true }
  | { success: false; error: string };

export async function updateAvailability(
  providerId: string,
  days: number[]
): Promise<UpdateAvailabilityResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    select: { id: true, userId: true },
  });

  if (!provider) {
    return { success: false, error: "Provider profile not found." };
  }

  if (provider.userId !== session.user.id) {
    return { success: false, error: "You are not authorized to edit this profile." };
  }

  const validDays = [...new Set(days)]
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    .sort((a, b) => a - b);

  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { availableDays: validDays.length > 0 ? validDays.join(",") : null },
  });

  revalidatePath("/providers");
  revalidatePath(`/providers/${providerId}`);
  revalidatePath("/dashboard");

  return { success: true };
}
