import { AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const REQUIRED_ENV_VARS = [
  { key: "DATABASE_URL", label: "Database URL", description: "Supabase PostgreSQL connection string" },
  { key: "AUTH_SECRET", label: "Auth Secret", description: "Random secret for Better Auth" },
  { key: "BETTER_AUTH_URL", label: "Auth URL", description: "Base URL of your app (e.g. http://localhost:3000)" },
  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", description: "Server-side Stripe API key (sk_test_... or sk_live_...)" },
  { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe Webhook Secret", description: "Webhook endpoint secret (whsec_...)" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Stripe Publishable Key", description: "Client-side Stripe key (pk_test_... or pk_live_...)" },
  { key: "RESEND_API_KEY", label: "Resend API Key", description: "Resend email service key (re_...)" },
  { key: "RESEND_FROM_EMAIL", label: "Resend From Email", description: "Verified sender address (e.g. SearveEASE <noreply@yourdomain.com>)" },
  { key: "SENTRY_DSN", label: "Sentry DSN", description: "Sentry error tracking DSN" },
  { key: "NEXT_PUBLIC_APP_URL", label: "App URL", description: "Public URL of your app" },
  { key: "BLOB_READ_WRITE_TOKEN", label: "Blob Read/Write Token", description: "Vercel Blob token for photo uploads (vercel_blob_...)" },
] as const;

const PLACEHOLDER_PREFIXES = ["YOUR_", "RE_...", "SK_TEST_...", "PK_TEST_...", "WHSEC_...", "HTTPS://...@SENTRY.IO", "POSTGRESQL://POSTGRES:"];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const upper = value.toUpperCase();
  return PLACEHOLDER_PREFIXES.some((prefix) => upper.includes(prefix));
}

export function EnvCheck() {
  const missing = REQUIRED_ENV_VARS.filter(({ key }) => isPlaceholder(process.env[key]));
  const hasMissing = missing.length > 0;

  if (!hasMissing) {
    return null;
  }

  return (
    <div className="mx-auto mb-8 w-full max-w-3xl">
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="size-5" aria-hidden />
            Missing required environment variables
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            The following environment variables are missing or still set to placeholder values. The app will not work correctly until these are configured.
          </p>
          <div className="grid gap-3">
            {missing.map(({ key, label, description }) => (
              <div key={key} className="flex flex-col gap-1 rounded-lg border border-yellow-200 bg-white p-3 dark:border-yellow-800 dark:bg-yellow-950/40">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-yellow-900 dark:text-yellow-100">{key}</span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">{label}</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">{description}</p>
              </div>
            ))}
          </div>
          <a
            href="/SETUP_CREDENTIALS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
          >
            View setup guide
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
