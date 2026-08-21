import { describe, it, expect, vi, beforeEach } from "vitest";
import { fileDispute } from "@/app/actions/bookings";
import { resolveDispute } from "@/app/actions/admin";

vi.mock("@/emails/booking-confirmation", () => ({ default: () => "BookingConfirmationEmail" }));
vi.mock("@/emails/new-booking-alert", () => ({ default: () => "NewBookingAlertEmail" }));
vi.mock("@/emails/payment-released", () => ({ default: () => "PaymentReleasedEmail" }));
vi.mock("@react-email/render", () => ({ render: async () => "<html></html>" }));
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
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    serviceProvider: {
      findUnique: vi.fn(),
    },
    booking: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    creditTransaction: {
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    dispute: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

describe("fileDispute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user is not signed in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await fileDispute("booking-1", "Provider never showed up");

    expect(result).toEqual({ success: false, error: "You must be signed in." });
  });

  it("returns error when reason is empty", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);

    const result = await fileDispute("booking-1", "   ");

    expect(result).toEqual({ success: false, error: "Please describe why you're filing a dispute." });
  });

  it("returns error when user is not a party to the booking", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "stranger" } } as any);
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({
      id: "booking-1",
      buyerId: "buyer-1",
      provider: { userId: "provider-user-1" },
    } as any);

    const result = await fileDispute("booking-1", "Provider never showed up");

    expect(result).toEqual({ success: false, error: "You are not a party to this booking." });
  });

  it("returns error when booking is in a terminal state", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "buyer-1" } } as any);
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({
      id: "booking-1",
      buyerId: "buyer-1",
      status: "released",
      provider: { userId: "provider-user-1" },
    } as any);

    const result = await fileDispute("booking-1", "Provider never showed up");

    expect(result).toEqual({ success: false, error: "This booking can no longer be disputed." });
  });

  it("returns error when a dispute already exists", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "buyer-1" } } as any);
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({
      id: "booking-1",
      buyerId: "buyer-1",
      status: "completed",
      provider: { userId: "provider-user-1" },
    } as any);
    vi.mocked(prisma.dispute.findUnique).mockResolvedValue({ id: "dispute-1" } as any);

    const result = await fileDispute("booking-1", "Provider never showed up");

    expect(result).toEqual({ success: false, error: "A dispute has already been filed for this booking." });
  });

  it("creates a dispute and marks the booking disputed", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "buyer-1" } } as any);
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({
      id: "booking-1",
      buyerId: "buyer-1",
      status: "completed",
      provider: { userId: "provider-user-1" },
    } as any);
    vi.mocked(prisma.dispute.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: "admin-1" }] as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback({
        dispute: { create: vi.fn().mockResolvedValue({ id: "dispute-1" }) },
        booking: { update: vi.fn().mockResolvedValue({}) },
      });
    });

    const result = await fileDispute("booking-1", "Provider never showed up");

    expect(result).toEqual({ success: true });
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe("resolveDispute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user is not admin", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1", isAdmin: false } } as any);

    const result = await resolveDispute("dispute-1", "refund_buyer", "");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error when dispute is not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1", isAdmin: true } } as any);
    vi.mocked(prisma.dispute.findUnique).mockResolvedValue(null);

    const result = await resolveDispute("dispute-1", "refund_buyer", "");

    expect(result).toEqual({ success: false, error: "Dispute not found" });
  });

  it("refunds the buyer when decision is refund_buyer", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "admin-1", isAdmin: true } } as any);
    vi.mocked(prisma.dispute.findUnique).mockResolvedValue({
      id: "dispute-1",
      status: "open",
      booking: {
        id: "booking-1",
        buyerId: "buyer-1",
        totalCredits: 120,
        provider: { userId: "provider-user-1" },
      },
    } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback({
        creditTransaction: {
          aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0 } }),
          create: vi.fn().mockResolvedValue({}),
        },
        booking: { update: vi.fn().mockResolvedValue({}) },
        dispute: { update: vi.fn().mockResolvedValue({}) },
      });
    });

    const result = await resolveDispute("dispute-1", "refund_buyer", "Buyer was right");

    expect(result).toEqual({ success: true });
  });

  it("pays the provider when decision is pay_provider", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "admin-1", isAdmin: true } } as any);
    vi.mocked(prisma.dispute.findUnique).mockResolvedValue({
      id: "dispute-1",
      status: "open",
      booking: {
        id: "booking-1",
        buyerId: "buyer-1",
        totalCredits: 120,
        provider: { userId: "provider-user-1" },
      },
    } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback({
        creditTransaction: {
          aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0 } }),
          create: vi.fn().mockResolvedValue({}),
        },
        booking: { update: vi.fn().mockResolvedValue({}) },
        dispute: { update: vi.fn().mockResolvedValue({}) },
      });
    });

    const result = await resolveDispute("dispute-1", "pay_provider", "");

    expect(result).toEqual({ success: true });
  });
});