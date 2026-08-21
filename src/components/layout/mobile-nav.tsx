"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Settings, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </DrawerTrigger>
      <DrawerContent showCloseButton={false}>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerDescription>Navigate and settings</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-1 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            render={<Link href="/providers" />}
            onSelect={() => setOpen(false)}
          >
            Providers
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            render={<Link href="/bookings" />}
            onSelect={() => setOpen(false)}
          >
            My Bookings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            render={<Link href="/wallet" />}
            onSelect={() => setOpen(false)}
          >
            Wallet
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            render={<Link href="/support" />}
            onSelect={() => setOpen(false)}
          >
            <Headphones className="size-4 mr-2" aria-hidden />
            Customer Care
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onSelect={(event) => {
              event.preventDefault();
              toggleTheme();
            }}
          >
            {isDark ? (
              <>
                <Sun className="size-4 mr-2" aria-hidden />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="size-4 mr-2" aria-hidden />
                Dark Mode
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            render={<Link href="/settings" />}
            onSelect={() => setOpen(false)}
          >
            <Settings className="size-4 mr-2" aria-hidden />
            Settings
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
