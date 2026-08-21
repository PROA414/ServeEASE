import { describe, it, expect, vi, beforeEach } from "vitest";
import { becomeProvider } from "@/app/actions/providers";

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
    serviceProvider: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateAvailability } from "@/app/actions/providers";

describe("becomeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user is not signed in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await becomeProvider({
      category: "cleaner",
      dailyRate: 100,
      halfDayRate: 60,
      bio: "",
      experience: "",
    });

    expect(result).toEqual({ success: false, error: "You must be signed in." });
  });

  it("returns error when user already has a provider profile", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue({ id: "provider-1" } as any);

    const result = await becomeProvider({
      category: "cleaner",
      dailyRate: 100,
      halfDayRate: 60,
      bio: "",
      experience: "",
    });

    expect(result).toEqual({ success: false, error: "You already have a provider profile." });
  });

  it("creates a provider profile when all conditions are met", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.serviceProvider.create).mockResolvedValue({ id: "provider-1" } as any);

    const result = await becomeProvider({
      category: "cleaner",
      dailyRate: 100,
      halfDayRate: 60,
      bio: "Experienced cleaner",
      experience: "5 years",
    });

    expect(result).toEqual({ success: true });
    expect(prisma.serviceProvider.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        category: "cleaner",
        dailyRate: 100,
        halfDayRate: 60,
        bio: "Experienced cleaner",
        experience: "5 years",
      },
    });
  });
});

describe("updateAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user is not signed in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await updateAvailability("provider-1", [1, 2, 3]);

    expect(result).toEqual({ success: false, error: "You must be signed in." });
  });

  it("returns error when provider profile is not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue(null);

    const result = await updateAvailability("provider-1", [1, 2, 3]);

    expect(result).toEqual({ success: false, error: "Provider profile not found." });
  });

  it("returns error when user is not the profile owner", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "other-user" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue({
      id: "provider-1",
      userId: "user-1",
    } as any);

    const result = await updateAvailability("provider-1", [1, 2, 3]);

    expect(result).toEqual({ success: false, error: "You are not authorized to edit this profile." });
  });

  it("stores sorted unique valid days", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue({
      id: "provider-1",
      userId: "user-1",
    } as any);
    vi.mocked(prisma.serviceProvider.update).mockResolvedValue({} as any);

    const result = await updateAvailability("provider-1", [6, 1, 3, 1, 99, -1]);

    expect(result).toEqual({ success: true });
    expect(prisma.serviceProvider.update).toHaveBeenCalledWith({
      where: { id: "provider-1" },
      data: { availableDays: "1,3,6" },
    });
  });

  it("sets null when no valid days selected", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user-1" } } as any);
    vi.mocked(prisma.serviceProvider.findUnique).mockResolvedValue({
      id: "provider-1",
      userId: "user-1",
    } as any);

    const result = await updateAvailability("provider-1", [99, -1]);

    expect(result).toEqual({ success: true });
    expect(prisma.serviceProvider.update).toHaveBeenCalledWith({
      where: { id: "provider-1" },
      data: { availableDays: null },
    });
  });
});
