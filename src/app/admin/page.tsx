import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAdminStats, getAdminBookings, getAdminUsers, getAdminDisputes } from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const metadata: Metadata = { title: "Admin" };

const VALID_TABS = new Set(["bookings", "disputes", "users"]);

const EMPTY_PAGINATION = { page: 1, pageSize: 10, total: 0, totalPages: 1 };

export default async function AdminPage({
  searchParams,
}: PageProps<"/admin">) {
  const session = await getSession();
  if (!session?.user || (session.user as { isAdmin?: boolean }).isAdmin !== true) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const tabRaw = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab = tabRaw && VALID_TABS.has(tabRaw) ? (tabRaw as "bookings" | "disputes" | "users") : "bookings";

  const pageRaw = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number.isFinite(Number(pageRaw)) && Number(pageRaw) >= 1 ? Number(pageRaw) : undefined;

  const stats = await getAdminStats();

  const [bookings, users, disputes] = await Promise.all([
    tab === "bookings" ? getAdminBookings(page) : Promise.resolve(null),
    tab === "users" ? getAdminUsers(page) : Promise.resolve(null),
    tab === "disputes" ? getAdminDisputes(page) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, bookings, and credits.
        </p>
      </div>

      <AdminDashboardClient
        initialStats={stats}
        initialBookings={bookings?.items ?? []}
        initialUsers={users?.items ?? []}
        initialDisputes={disputes?.items ?? []}
        bookingsPagination={bookings?.pagination ?? EMPTY_PAGINATION}
        usersPagination={users?.pagination ?? EMPTY_PAGINATION}
        disputesPagination={disputes?.pagination ?? EMPTY_PAGINATION}
        activeTab={tab}
      />
    </div>
  );
}