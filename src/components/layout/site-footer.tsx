import Link from "next/link";
import { Sparkles, ShieldCheck, Users, Star } from "lucide-react";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2.5 font-semibold">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <span>SearveEASE</span>
              </Link>
              <p className="max-w-sm text-sm text-muted-foreground">
                Book trusted home service providers — cleaners, nannies, cooks
                and handymen — and pay with credits. Simple, secure, and
                stress-free.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" aria-hidden />
                  Secure escrow
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 text-primary" aria-hidden />
                  Verified ratings
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold">Explore</h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <h2 className="text-sm font-semibold">Trusted by thousands</h2>
            <div className="flex items-center gap-6 text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-primary" aria-hidden />
                2,000+ users
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="size-4 text-primary" aria-hidden />
                4.8 avg rating
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} SearveEASE. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Made with care for busy families.
            <Sparkles className="size-3.5 text-primary" aria-hidden />
          </p>
        </div>
      </div>
    </footer>
  );
}