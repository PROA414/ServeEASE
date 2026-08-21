import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminBookings, getAdminUsers, getAdminDisputes } from "@/app/actions/admin";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    dispute: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const adminSession = { user: { id: "admin-1", isAdmin: true } };

describe("admin paged queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when not admin", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "u1", isAdmin: false } } as any);

    expect(await getAdminBookings()).toBeNull();
    expect(await getAdminUsers()).toBeNull();
    expect(await getAdminDisputes()).toBeNull();
  });

  it("paginates bookings with counts and safe page clamping", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.booking.count).mockResolvedValue(25);
    vi.mocked(prisma.booking.findMany).mockImplementation((({ skip, take }: any) =>
      Promise.resolve(
        Array.from({ length: take }, (_, i) => ({
          id: `booking-${skip + i + 1}`,
          totalCredits: 100,
          date: new Date(),
          status: "pending",
          buyer: { id: "buyer-1", name: "Buyer", email: "b@example.com" },
          provider: { user: { id: "provider-1", name: "Provider", email: "p@example.com" } },
        }))
      )
    ) as any);

    const page2 = await getAdminBookings(2);
    expect(page2).not.toBeNull();
    expect(page2!.pagination).toEqual({ page: 2, pageSize: 10, total: 25, totalPages: 3 });
    expect(page2!.items).toHaveLength(10);
    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );

    // page 99 should clamp to the last page (3)
    const outOfRange = await getAdminBookings(99);
    expect(outOfRange!.pagination.page).toBe(3);
    expect(prisma.booking.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it("returns empty pagination shape for zero rows", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.booking.count).mockResolvedValue(0);
    vi.mocked(prisma.booking.findMany).mockResolvedValue([] as any);

    const result = await getAdminBookings(1);
    expect(result!.pagination).toEqual({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
    expect(result!.items).toEqual([]);
  });

  it("paginates users and disputes", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as any);

    vi.mocked(prisma.user.count).mockResolvedValue(7);
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    const users = await getAdminUsers(1);
    expect(users!.pagination.total).toBe(7);
    expect(users!.pagination.totalPages).toBe(1);

    vi.mocked(prisma.dispute.count).mockResolvedValue(13);
    vi.mocked(prisma.dispute.findMany).mockResolvedValue([] as any);
    const disputes = await getAdminDisputes(2);
    expect(disputes!.pagination).toEqual({ page: 2, pageSize: 10, total: 13, totalPages: 2 });
  });
});