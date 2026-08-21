import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Payment cancelled" };

export default async function PaymentCancelPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center gap-3 text-center">
          <CardTitle className="text-2xl">Payment cancelled</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Your payment was cancelled. No credits were added.
          </p>
          <Button className="w-full" size="lg" render={<Link href="/wallet" />}>
            Return to wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
