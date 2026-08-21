import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about credits, bookings, payments and disputes.",
};

const FAQS = [
  {
    question: "What are credits and how do they work?",
    answer:
      "Credits are SearveEASE's in-app currency. You buy credits from your wallet and use them to pay providers. When you book, the credits are placed in secure escrow — your provider doesn't receive them until you release payment after the job is done.",
  },
  {
    question: "How do I buy credits?",
    answer:
      "Go to your Wallet and pick a credit package. You'll be redirected to a secure Stripe checkout to complete the payment, and your credits appear in your account immediately after.",
  },
  {
    question: "What happens if I need to cancel a booking?",
    answer:
      "You can cancel a pending or confirmed booking from the booking detail page. If you cancel before the job starts, your held credits are refunded to your wallet automatically.",
  },
  {
    question: "How do I get paid as a provider?",
    answer:
      "After you complete a job and check out, the buyer releases the payment. The held credits are then paid out to you and appear in your earnings. You can track your balance from your provider dashboard.",
  },
  {
    question: "What should I do if there's a problem with a booking?",
    answer:
      "You can file a dispute from the booking detail page. Our support team reviews the details and either refunds the buyer or pays the provider based on the evidence, including check-in/check-out photos and timestamps.",
  },
  {
    question: "How are providers verified?",
    answer:
      "Providers go through an onboarding process where their identity and details are checked. Verified providers display a badge on their profile and cards, so you can book with confidence.",
  },
  {
    question: "Can I message my provider before the job?",
    answer:
      "Yes. Once a booking is made, you can chat with your provider directly from the booking's chat page to share details, ask questions, or coordinate logistics.",
  },
  {
    question: "How do ratings work?",
    answer:
      "After you release payment, you can rate your experience from 1 to 5 stars and leave a comment. Your rating helps other users choose the right provider for their needs.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-muted-foreground">
          Everything you need to know about credits, bookings, payments and
          disputes. Can&apos;t find what you&apos;re looking for?{" "}
          <Link
            href="/support"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Contact support
          </Link>
          .
        </p>
      </div>

      <FaqAccordion items={FAQS} />
    </div>
  );
}