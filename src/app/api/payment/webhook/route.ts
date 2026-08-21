import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits ?? 0);

    if (!userId || credits <= 0) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    const currentBalance = await prisma.creditTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const balance = currentBalance._sum.amount ?? 0;

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: credits,
        balance: balance + credits,
        type: "purchase",
        reference: session.id,
        description: `Purchased ${credits} credits`,
        status: "completed",
      },
    });
  }

  return NextResponse.json({ received: true });
}
