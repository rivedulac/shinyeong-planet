import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VirtualControlsToggle from "../VirtualControlsToggle";

describe("VirtualControlsToggle", () => {
  it("should render with OFF state", () => {
    render(<VirtualControlsToggle isEnabled={false} onToggle={() => {}} />);

    // The toggle should display the OFF text
    const toggleButton = screen.getByText("Virtual Controls: OFF");
    expect(toggleButton).toBeInTheDocument();

    // Check that the indicator has the disabled color
    const indicator = toggleButton.querySelector("span");
    expect(indicator).toHaveStyle("background-color: rgba(100, 100, 100, 0.8)");
  });

  it("should render with ON state", () => {
    render(<VirtualControlsToggle isEnabled={true} onToggle={() => {}} />);

    // The toggle should display the ON text
    const toggleButton = screen.getByText("Virtual Controls: ON");
    expect(toggleButton).toBeInTheDocument();

    // Check that the indicator has the enabled color
    const indicator = toggleButton.querySelector("span");
    expect(indicator).toHaveStyle("background-color: rgba(233, 69, 96, 0.8)");
  });

  it("should call onToggle when clicked", () => {
    const mockToggle = vi.fn();
    render(<VirtualControlsToggle isEnabled={true} onToggle={mockToggle} />);

    // Find and click the toggle button
    const toggleButton = screen.getByText("Virtual Controls: ON");
    fireEvent.click(toggleButton);

    // Check that the onToggle function was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onToggle when touched", () => {
    const mockToggle = vi.fn();
    render(<VirtualControlsToggle isEnabled={true} onToggle={mockToggle} />);

    // Find and touch the toggle button
    const toggleButton = screen.getByText("Virtual Controls: ON");
    fireEvent.touchEnd(toggleButton);

    // Check that the onToggle function was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should have different background colors for enabled/disabled states", () => {
    // First with enabled=true
    const { rerender } = render(
      <VirtualControlsToggle isEnabled={true} onToggle={() => {}} />
    );

    let toggleButton = screen.getByText("Virtual Controls: ON");
    expect(toggleButton).toHaveStyle(
      "background-color: rgba(83, 52, 131, 0.8)"
    );

    // Re-render with enabled=false
    rerender(<VirtualControlsToggle isEnabled={false} onToggle={() => {}} />);

    toggleButton = screen.getByText("Virtual Controls: OFF");
    expect(toggleButton).toHaveStyle("background-color: rgba(40, 40, 60, 0.8)");
  });
});
