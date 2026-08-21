"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UpdatePreferencesResult =
  | { success: true }
  | { success: false; error: string };

export async function updateNotificationPreferences(input: {
  notifyBookings?: boolean;
  notifyMessages?: boolean;
}): Promise<UpdatePreferencesResult> {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return { success: false, error: "You must be signed in." };
  }

  const data: Record<string, boolean> = {};
  if (typeof input.notifyBookings === "boolean") data.notifyBookings = input.notifyBookings;
  if (typeof input.notifyMessages === "boolean") data.notifyMessages = input.notifyMessages;

  if (Object.keys(data).length === 0) {
    return { success: false, error: "Nothing to update." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  revalidatePath("/settings");
  return { success: true };
}
