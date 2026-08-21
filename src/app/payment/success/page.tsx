import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Payment successful" };

export default async function PaymentSuccessPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="size-8" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-2xl">Payment successful</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Your credits have been added to your wallet.
          </p>
          <Button className="w-full" size="lg" render={<Link href="/wallet" />}>
            <Sparkles className="size-4" aria-hidden />
            Go to wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
