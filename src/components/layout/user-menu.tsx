"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  UserRoundPlus,
  UserRoundCheck,
} from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function UserMenu({
  name,
  email,
  image,
  isProvider,
  isAdmin,
}: {
  name: string;
  email: string;
  image?: string | null;
  isProvider: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    setPending(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out");
          router.push("/");
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.error.message ?? "Failed to sign out");
          setPending(false);
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Avatar className="size-8">
          {image ? <AvatarImage src={image} alt={name} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard className="size-4" aria-hidden />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/wallet" />}>
          <Wallet className="size-4" aria-hidden />
          Wallet
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/notifications" />}>
          <Bell className="size-4" aria-hidden />
          Notifications
        </DropdownMenuItem>
        {isProvider ? (
          <DropdownMenuItem render={<Link href="/providers" />}>
            <UserRoundCheck className="size-4" aria-hidden />
            My provider profile
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem render={<Link href="/become-provider" />}>
            <UserRoundPlus className="size-4" aria-hidden />
            Become a provider
          </DropdownMenuItem>
        )}
        {isAdmin ? (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldCheck className="size-4" aria-hidden />
            Admin
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            handleSignOut();
          }}
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}