import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBooking } from "@/app/actions/bookings";

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
    },
    serviceProvider: {
      findUnique: vi.fn(),
    },
    booking: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    creditTransaction: {
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

describe("createBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user is not signed in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await createBooking({
      providerId: "provider-1",
      date: new Date("2026-08-26"),
      duration: "full",
      specialInstructions: "",
    });

    expect(result).toEqual({ success: false, error: "You must be signed in to book a provider." });
  });

  it("returns error when provider is not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue(null);

    const result = await createBooking({
      providerId: "provider-1",
      date: new Date("2026-08-26"),
      duration: "full",
      specialInstructions: "",
    });

    expect(result).toEqual({ success: false, error: "That provider is no longer available." });
  });

  it("returns error when user has insufficient credits", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue({
      id: "provider-1",
      dailyRate: 120,
      halfDayRate: 70,
    } as any);
    vi.mocked(prisma.creditTransaction.aggregate).mockResolvedValue({ _sum: { amount: 50 } } as any);

    const result = await createBooking({
      providerId: "provider-1",
      date: new Date("2026-08-26"),
      duration: "full",
      specialInstructions: "",
    });

    expect(result).toEqual({
      success: false,
      error: "Insufficient credits. Please purchase more.",
    });
  });

  it("returns error when provider is not available on the chosen day", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue({
      id: "provider-1",
      dailyRate: 120,
      halfDayRate: 70,
      availableDays: "1,2,3,4,5", // Mon-Fri
    } as any);
    // 2026-08-23 is a Sunday (getDay() === 0)
    const sunday = new Date("2026-08-23");
    sunday.setHours(12, 0, 0, 0);

    const result = await createBooking({
      providerId: "provider-1",
      date: sunday,
      duration: "full",
      specialInstructions: "",
    });

    expect(result).toEqual({
      success: false,
      error: "The provider isn't available on that day. Pick a different date.",
    });
    expect(prisma.creditTransaction.aggregate).not.toHaveBeenCalled();
  });

  it("creates a booking when all conditions are met", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique)
      .mockResolvedValueOnce({
        id: "provider-1",
        dailyRate: 120,
        halfDayRate: 70,
      } as any)
      .mockResolvedValueOnce({
        id: "provider-1",
        user: { id: "provider-user-1", email: "maria@example.com", name: "Maria Santos" },
      } as any);
    vi.mocked(prisma.creditTransaction.aggregate).mockResolvedValue({ _sum: { amount: 200 } } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback({
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: "booking-1", providerId: "provider-1", totalCredits: 120, date: new Date("2026-08-26"), duration: "full" }),
        },
        creditTransaction: {
          create: vi.fn().mockResolvedValue({}),
        },
      });
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: "buyer@example.com", name: "Buyer" } as any);

    const result = await createBooking({
      providerId: "provider-1",
      date: new Date("2026-08-26"),
      duration: "full",
      specialInstructions: "",
    });

    expect(result).toEqual({ success: true, bookingId: "booking-1" });
  });
});
