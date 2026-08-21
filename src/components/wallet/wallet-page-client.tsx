"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCredits, formatDate } from "@/lib/format";
import { Sparkles, Loader2, WalletCards } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type Transaction = {
  id: string;
  amount: number;
  balance: number;
  type: string;
  status: string;
  description: string | null;
  createdAt: Date;
};

const CREDIT_PACKAGES = [
  { credits: 100, price: 1000 },
  { credits: 500, price: 5000 },
  { credits: 1000, price: 10000 },
  { credits: 5000, price: 50000 },
];

type WalletPageClientProps = {
  transactions: Transaction[];
};

export function WalletPageClient({
  transactions,
}: WalletPageClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleBuy = async (credits: number) => {
    setLoading(credits.toString());
    try {
      const res = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to start checkout");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Buy credits</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Button
              key={pkg.credits}
              variant="outline"
              className="flex flex-col items-center gap-1 py-6"
              onClick={() => handleBuy(pkg.credits)}
              disabled={loading !== null}
            >
              {loading === pkg.credits.toString() ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4 text-primary" aria-hidden />
              )}
              <span className="text-lg font-semibold">
                {formatCredits(pkg.credits)}
              </span>
              <span className="text-xs text-muted-foreground">
                ${(pkg.price / 100).toFixed(2)}
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              icon={WalletCards}
              title="No transactions yet"
              description="Buy credits to start booking providers. Your purchase history will show up here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm capitalize">{tx.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.description ?? "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right text-sm font-medium ${
                        tx.amount >= 0 ? "text-green-600" : "text-destructive"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {formatCredits(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCredits(tx.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
