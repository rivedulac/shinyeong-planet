import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MinimapToggle from "../MinimapToggle";

describe("MinimapToggle", () => {
  it("should render with correct visible state", () => {
    const mockToggle = vi.fn();
    render(<MinimapToggle isVisible={true} onToggle={mockToggle} />);

    // Should show map emoji when visible
    expect(screen.getByText("🗺️")).toBeInTheDocument();

    // Should have the visible style
    const button = screen.getByTestId("minimap-toggle");
    expect(button).toHaveStyle("background-color: rgba(83, 52, 131, 0.8)");
  });

  it("should render with correct hidden state", () => {
    const mockToggle = vi.fn();
    render(<MinimapToggle isVisible={false} onToggle={mockToggle} />);

    // Should show pin emoji when hidden
    expect(screen.getByText("📍")).toBeInTheDocument();

    // Should have the hidden style
    const button = screen.getByTestId("minimap-toggle");
    expect(button).toHaveStyle("background-color: rgba(40, 40, 60, 0.8)");
  });

  it("should call onToggle when clicked", () => {
    const mockToggle = vi.fn();
    render(<MinimapToggle isVisible={true} onToggle={mockToggle} />);

    // Click the button
    fireEvent.click(screen.getByTestId("minimap-toggle"));

    // Check that onToggle was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should have correct ARIA attributes", () => {
    const mockToggle = vi.fn();
    render(<MinimapToggle isVisible={true} onToggle={mockToggle} />);

    // Check for proper accessibility attributes
    const button = screen.getByTestId("minimap-toggle");
    expect(button).toHaveAttribute("aria-label", "Hide minimap");
  });

  it("should update ARIA label when visibility changes", () => {
    const mockToggle = vi.fn();
    const { rerender } = render(
      <MinimapToggle isVisible={true} onToggle={mockToggle} />
    );

    // Initially should say "Hide minimap"
    let button = screen.getByTestId("minimap-toggle");
    expect(button).toHaveAttribute("aria-label", "Hide minimap");

    // Rerender with different visibility
    rerender(<MinimapToggle isVisible={false} onToggle={mockToggle} />);

    // Now should say "Show minimap"
    button = screen.getByTestId("minimap-toggle");
    expect(button).toHaveAttribute("aria-label", "Show minimap");
  });
});
