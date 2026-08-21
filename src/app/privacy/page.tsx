import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SearveEASE collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground">
        Last updated: August 2026
      </p>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            1. Information we collect
          </h2>
          <p>
            We collect the information you provide when you create an account,
            such as your name, email address and profile details, as well as
            booking, messaging and transaction data generated while using the
            platform.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            2. How we use your information
          </h2>
          <p>
            We use your information to provide and improve our services,
            process payments, verify providers, send booking notifications and
            respond to support requests.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            3. Payments
          </h2>
          <p>
            Payments are processed securely by our payment provider. We do not
            store your full card details on our servers.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            4. Data sharing
          </h2>
          <p>
            We share limited information between buyers and providers as needed
            to complete bookings. We do not sell your personal information to
            third parties.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            5. Your choices
          </h2>
          <p>
            You can review and update your profile information from your
            settings, adjust notification preferences, or contact us to request
            deletion of your account data.
          </p>
        </section>
      </div>
    </div>
  );
}