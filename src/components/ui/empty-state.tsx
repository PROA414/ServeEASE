import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  href: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-8" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <Button render={<Link href={action.href} />} className="mt-1">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}