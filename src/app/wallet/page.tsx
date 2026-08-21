import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatCredits } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletPageClient } from "@/components/wallet/wallet-page-client";

export const metadata: Metadata = { title: "Wallet" };

export default async function WalletPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?next=/wallet");

  const balanceResult = await prisma.creditTransaction.aggregate({
    where: { userId: session.user.id },
    _sum: { amount: true },
  });

  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const balance = balanceResult._sum.amount ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your credits and view transaction history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-2xl font-bold">
              {formatCredits(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <WalletPageClient transactions={transactions} />
    </div>
  );
}
