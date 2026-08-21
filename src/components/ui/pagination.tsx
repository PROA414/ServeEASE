import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PaginationData = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function PaginationControls({
  pagination,
  buildHref,
  className,
}: {
  pagination: PaginationData;
  buildHref: (page: number) => string;
  className?: string;
}) {
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - page) <= 1
    ) {
      pages.push(i);
    }
  }

  const rows: Array<number | "…"> = [];
  let prev: number | null = null;
  for (const p of pages) {
    if (prev !== null && p - prev > 1) rows.push("…");
    rows.push(p);
    prev = p;
  }

  const from = total === 0 ? 0 : (page - 1) * pagination.pageSize + 1;
  const to = Math.min(page * pagination.pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          render={page > 1 ? <Link href={buildHref(page - 1)} /> : undefined}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        {rows.map((row, index) =>
          row === "…" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={row}
              variant={row === page ? "default" : "outline"}
              size="sm"
              className={cn(row === page && "pointer-events-none")}
              render={row !== page ? <Link href={buildHref(row)} /> : undefined}
              aria-current={row === page ? "page" : undefined}
            >
              {row}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          render={page < totalPages ? <Link href={buildHref(page + 1)} /> : undefined}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}