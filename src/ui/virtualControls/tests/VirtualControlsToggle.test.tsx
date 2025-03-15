import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VirtualControlsToggle from "../VirtualControlsToggle";

describe("VirtualControlsToggle", () => {
  it("should render with OFF state", () => {
    render(<VirtualControlsToggle isEnabled={false} onToggle={() => {}} />);

    // The toggle should display the OFF text
    const toggleButton = screen.getByText("⌨️");
    expect(toggleButton).toBeInTheDocument();
  });

  it("should call onToggle when clicked", () => {
    const mockToggle = vi.fn();
    render(<VirtualControlsToggle isEnabled={true} onToggle={mockToggle} />);

    // Find and click the toggle button
    const toggleButton = screen.getByText("⌨️");
    fireEvent.click(toggleButton);

    // Check that the onToggle function was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onToggle when touched", () => {
    const mockToggle = vi.fn();
    render(<VirtualControlsToggle isEnabled={true} onToggle={mockToggle} />);

    // Find and touch the toggle button
    const toggleButton = screen.getByText("⌨️");
    fireEvent.touchEnd(toggleButton);

    // Check that the onToggle function was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should have different background colors for enabled/disabled states", () => {
    // First with enabled=true
    const { rerender } = render(
      <VirtualControlsToggle isEnabled={true} onToggle={() => {}} />
    );

    let toggleButton = screen.getByText("⌨️");
    expect(toggleButton).toHaveStyle(
      "background-color: rgba(83, 52, 131, 0.8)"
    );

    // Re-render with enabled=false
    rerender(<VirtualControlsToggle isEnabled={false} onToggle={() => {}} />);

    toggleButton = screen.getByText("⌨️");
    expect(toggleButton).toHaveStyle("background-color: rgba(40, 40, 60, 0.8)");
  });
});
