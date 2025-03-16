// src/ui/tests/InfoToggle.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InfoToggle from "../InfoToggle";

describe("InfoToggle", () => {
  it("should render with the info emoji", () => {
    const mockToggle = vi.fn();
    render(<InfoToggle onToggle={mockToggle} active={false} />);

    // Check that the button contains the info emoji
    const button = screen.getByText("ℹ️");
    expect(button).toBeInTheDocument();
  });

  it("should call onToggle when clicked", () => {
    const mockToggle = vi.fn();
    render(<InfoToggle onToggle={mockToggle} active={false} />);

    // Find the button and click it
    const button = screen.getByText("ℹ️");
    fireEvent.click(button);

    // Check that the onToggle function was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should have different style when active", () => {
    const mockToggle = vi.fn();

    // First render with active=false
    const { rerender } = render(
      <InfoToggle onToggle={mockToggle} active={false} />
    );

    // Find the button
    const button = screen.getByRole("button");

    // Check that it has the inactive style
    expect(button).toHaveStyle("background-color: rgba(40, 40, 60, 0.8)");

    // Re-render with active=true
    rerender(<InfoToggle onToggle={mockToggle} active={true} />);

    // Check that it now has the active style
    expect(button).toHaveStyle("background-color: rgba(83, 52, 131, 0.8)");
  });
});
