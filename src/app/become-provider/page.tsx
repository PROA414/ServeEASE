import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BecomeProviderForm } from "@/components/providers/become-provider-form";

export const metadata: Metadata = { title: "Become a provider" };

export default async function BecomeProviderPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?next=/become-provider");

  const existing = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (existing) {
    redirect("/providers");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Become a provider
        </h1>
        <p className="text-muted-foreground">
          Create your profile and start accepting bookings.
        </p>
      </div>
      <BecomeProviderForm />
    </div>
  );
}
