"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "rating", label: "Highest rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "bookings", label: "Most booked" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((o) => o.value));

export function SearchSort({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);

  const currentSortRaw = searchParams.get("sort");
  const currentSort: SortValue =
    currentSortRaw && VALID_SORTS.has(currentSortRaw)
      ? (currentSortRaw as SortValue)
      : "rating";

  const buildHref = (nextQ: string, sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");
    if (sort !== "rating") params.set("sort", sort);
    else params.delete("sort");
    const qs = params.toString();
    return qs ? `/providers?${qs}` : "/providers";
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildHref(q, currentSort));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={applySearch} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or category…"
          className="pl-9"
          aria-label="Search providers"
        />
      </form>
      <Select
        value={currentSort}
        onValueChange={(value) => router.push(buildHref(q, value ?? "rating"))}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}