import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for using SearveEASE.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Terms of Service
      </h1>
      <p className="text-sm text-muted-foreground">
        Last updated: August 2026
      </p>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            1. About these terms
          </h2>
          <p>
            These terms govern your use of the SearveEASE platform. By creating
            an account, booking a provider, or using our services, you agree to
            these terms.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            2. Credits & payments
          </h2>
          <p>
            Credits are purchased through our platform and held in your wallet.
            Booked credits are held in escrow and only released to providers
            once the buyer confirms the job is complete. Credits are
            non-refundable except where a booking is cancelled or a dispute is
            resolved in the buyer&apos;s favor.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            3. Provider services
          </h2>
          <p>
            Providers are independent contractors. SearveEASE facilitates
            connections, verification, payments and dispute resolution, but is
            not a party to the service agreement between buyer and provider.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            4. Acceptable use
          </h2>
          <p>
            You agree not to misuse the platform, attempt to defraud other
            users, or use the service for any unlawful purpose. Violations may
            result in account suspension and forfeiture of credits.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            5. Disputes
          </h2>
          <p>
            Disputes are reviewed by our support team based on available
            evidence, including check-in and check-out records. Our decision is
            final and binding on the parties.
          </p>
        </section>
      </div>
    </div>
  );
}