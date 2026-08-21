import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "@/components/bookings/booking-form";

vi.mock("@/app/actions/bookings", () => ({
  createBooking: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { createBooking } from "@/app/actions/bookings";

describe("BookingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with provider rates", () => {
    render(
      <BookingForm
        providerId="provider-1"
        dailyRate={120}
        halfDayRate={70}
        isAuthenticated={true}
      />
    );

    expect(screen.getByText("Date")).toBeDefined();
    expect(screen.getByText("Duration")).toBeDefined();
    expect(screen.getByText("Total")).toBeDefined();
  });

  it("shows validation errors when submitting empty", async () => {
    const user = userEvent.setup();
    render(
      <BookingForm
        providerId="provider-1"
        dailyRate={120}
        halfDayRate={70}
        isAuthenticated={true}
      />
    );

    const submitButton = screen.getByRole("button", { name: /Book Now/ });
    await user.click(submitButton);

    expect(screen.getByText("Please pick a date")).toBeDefined();
    expect(screen.getByText("Choose a duration")).toBeDefined();
    expect(createBooking).not.toHaveBeenCalled();
  });

  it("updates total credits when duration is selected", async () => {
    const user = userEvent.setup();
    render(
      <BookingForm
        providerId="provider-1"
        dailyRate={120}
        halfDayRate={70}
        isAuthenticated={true}
      />
    );

    const halfDayRadio = screen.getByRole("radio", { name: /Half Day/ });
    await user.click(halfDayRadio);

    expect(screen.getByText(/70 credits/)).toBeDefined();
  });
});
