import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CategoryFilter({ active }: { active?: string }) {
  const filters = [{ value: undefined, label: "All" }, ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = active === filter.value;
        return (
          <Button
            key={filter.label}
            variant={isActive ? "default" : "outline"}
            size="sm"
            render={
              <Link
                href={
                  filter.value ? `/providers?category=${filter.value}` : "/providers"
                }
                aria-current={isActive ? "page" : undefined}
              />
            }
            className={cn(
              "rounded-full",
              !isActive && "bg-transparent hover:bg-muted"
            )}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}