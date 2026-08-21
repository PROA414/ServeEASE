import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/settings-client";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile, appearance and notification preferences.",
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?next=/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notifyBookings: true, notifyMessages: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, appearance and preferences.
        </p>
      </div>
      <SettingsClient
        name={session.user.name}
        email={session.user.email}
        initialNotifyBookings={user?.notifyBookings ?? true}
        initialNotifyMessages={user?.notifyMessages ?? true}
      />
    </div>
  );
}