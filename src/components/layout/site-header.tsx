import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user;

  let isProvider = false;
  if (user?.id) {
    const profile = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    isProvider = profile != null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <span className="hidden text-base sm:inline">SearveEASE</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" render={<Link href="/providers" />}>
              Providers
            </Button>
            <Button variant="ghost" render={<Link href="/bookings" />}>
              My Bookings
            </Button>
            <Button variant="ghost" render={<Link href="/wallet" />}>
              Wallet
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <MobileNav />
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell />
              <UserMenu
                name={user.name}
                email={user.email}
                image={user.image}
                isProvider={isProvider}
                isAdmin={(user as { isAdmin?: boolean }).isAdmin === true}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button render={<Link href="/signup" />}>Sign up</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
