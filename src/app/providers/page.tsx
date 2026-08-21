import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { ProviderCard } from "@/components/providers/provider-card";
import { CategoryFilter } from "@/components/providers/category-filter";
import { ProviderGridSkeleton } from "@/components/providers/provider-grid-skeleton";
import { SearchSort, type SortValue } from "@/components/providers/search-sort";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Find Help" };

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.value));
const VALID_SORTS = new Set<SortValue>(["rating", "price_asc", "price_desc", "bookings"]);

export default async function ProvidersPage({
  searchParams,
}: PageProps<"/providers">) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

const category =
  categoryParam && VALID_CATEGORIES.has(categoryParam as (typeof CATEGORIES)[number]["value"])
    ? (categoryParam as (typeof CATEGORIES)[number]["value"])
    : undefined;

  const qRaw = Array.isArray(params.q) ? params.q[0] : params.q;
  const q = (qRaw ?? "").trim();

  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort: SortValue = sortRaw && VALID_SORTS.has(sortRaw as SortValue)
    ? (sortRaw as SortValue)
    : "rating";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Find help
        </h1>
        <p className="text-muted-foreground">
          Browse trusted cleaners, nannies, cooks and handymen ready to help.
        </p>
      </div>

      <CategoryFilter active={category} />
      <SearchSort initialQ={q} />

      <Suspense
        key={`${category ?? "all"}-${q}-${sort}`}
        fallback={<ProviderGridSkeleton />}
      >
        <ProviderGrid category={category} q={q} sort={sort} />
      </Suspense>
    </div>
  );
}

async function ProviderGrid({
  category,
  q,
  sort,
}: {
  category?: string;
  q: string;
  sort: SortValue;
}) {
  const where = {
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { user: { name: { contains: q } } },
            { category: { contains: q } },
            { bio: { contains: q } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? [{ dailyRate: "asc" as const }, { rating: "desc" as const }]
      : sort === "price_desc"
        ? [{ dailyRate: "desc" as const }, { rating: "desc" as const }]
        : sort === "bookings"
          ? [{ totalBookings: "desc" as const }, { rating: "desc" as const }]
          : [{ rating: "desc" as const }, { totalBookings: "desc" as const }];

  const providers = await prisma.serviceProvider.findMany({
    where,
    include: {
      user: { select: { name: true, image: true } },
      bookings: {
        where: { status: "released", comment: { not: null } },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          comment: true,
          buyer: { select: { name: true } },
        },
      },
    },
    orderBy,
  });

  if (providers.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={q ? "No providers match your search" : "No providers found"}
        description={
          q
            ? "Try a different name, category or keyword."
            : "Try a different category, or check back soon."
        }
        action={{ label: "Clear search", href: "/providers" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={{
            id: provider.id,
            category: provider.category,
            dailyRate: provider.dailyRate,
            halfDayRate: provider.halfDayRate,
            rating: provider.rating,
            totalBookings: provider.totalBookings,
            verified: provider.verified,
            user: { name: provider.user.name, image: provider.user.image },
            latestReview: provider.bookings[0]
              ? {
                  comment: provider.bookings[0].comment ?? "",
                  reviewerName: provider.bookings[0].buyer.name,
                }
              : null,
          }}
        />
      ))}
    </div>
  );
}