// src/ui/common/tests/ToggleButton.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ToggleButton from "../ToggleButton";
import {
  TOGGLE_ACTIVE_COLOR,
  TOGGLE_INACTIVE_COLOR,
  TOGGLE_BUTTON_SIZE,
} from "@/config/constants";

// Mock the constants to ensure test stability
vi.mock("@/config/constants", () => ({
  CORNER_MARGIN: "2%",
  TOGGLE_BUTTON_SIZE: "min(40px, 12vw)",
  MEDIUM_FONT_SIZE: "2rem",
  TOGGLE_ACTIVE_COLOR: "rgba(83, 52, 131, 0.8)",
  TOGGLE_INACTIVE_COLOR: "rgba(40, 40, 60, 0.8)",
  TOGGLE_BORDER_COLOR: "rgba(255, 255, 255, 0.3)",
}));

// Mock the useResponsiveControls hook
vi.mock("@/hooks/useResponsiveControls", () => ({
  useResponsiveControls: vi.fn(() => 1.0),
}));

describe("ToggleButton", () => {
  it("should render with the provided icon", () => {
    render(
      <ToggleButton
        isActive={false}
        onToggle={() => {}}
        icon="⚙️"
        position={{ top: "2%" }}
      />
    );

    // Check that the icon is displayed
    const button = screen.getByText("⚙️");
    expect(button).toBeInTheDocument();
  });

  it("should call onToggle when clicked", () => {
    const mockToggle = vi.fn();
    render(
      <ToggleButton
        isActive={false}
        onToggle={mockToggle}
        icon="⚙️"
        position={{ top: "2%" }}
      />
    );

    // Find the button and click it
    const button = screen.getByText("⚙️");
    fireEvent.click(button);

    // Check that the onToggle function was called
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("should have different background colors for active/inactive states", () => {
    // First render with isActive=false
    const { rerender } = render(
      <ToggleButton
        isActive={false}
        onToggle={() => {}}
        icon="⚙️"
        position={{ top: "2%" }}
      />
    );

    // Check that it has the inactive background color
    let button = screen.getByRole("button");
    expect(button).toHaveStyle(`background-color: ${TOGGLE_INACTIVE_COLOR}`);

    // Re-render with isActive=true
    rerender(
      <ToggleButton
        isActive={true}
        onToggle={() => {}}
        icon="⚙️"
        position={{ top: "2%" }}
      />
    );

    // Check that it has the active background color
    button = screen.getByRole("button");
    expect(button).toHaveStyle(`background-color: ${TOGGLE_ACTIVE_COLOR}`);
  });

  it("should set aria-label when provided", () => {
    render(
      <ToggleButton
        isActive={false}
        onToggle={() => {}}
        icon="⚙️"
        position={{ top: "2%" }}
        label="Settings toggle"
      />
    );

    // Check that the aria-label is set correctly
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Settings toggle");
  });

  it("should position based on provided position props", () => {
    // Test bottom-left positioning
    render(
      <ToggleButton
        isActive={false}
        onToggle={() => {}}
        icon="⚙️"
        position={{ bottom: "10px", left: "10px" }}
      />
    );

    // Check positioning styles
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("bottom: 10px");
    expect(button).toHaveStyle("left: 10px");
  });

  it("should set the correct transform origin based on position", () => {
    // Test top-right positioning
    const { rerender } = render(
      <ToggleButton
        isActive={false}
        onToggle={() => {}}
        icon="⚙️"
        position={{ top: "10px", right: "10px" }}
      />
    );

    // Check transform origin for top-right
    let button = screen.getByRole("button");
    expect(button).toHaveStyle("transform-origin: top right");

    // Test bottom-left positioning
    rerender(
      <ToggleButton
        isActive={false}
        onToggle={() => {}}
        icon="⚙️"
        position={{ bottom: "10px", left: "10px" }}
      />
    );

    // Check transform origin for bottom-left
    button = screen.getByRole("button");
    expect(button).toHaveStyle("transform-origin: bottom left");
  });

  it("should have circular shape with 50% border radius", () => {
    render(
      <ToggleButton
        isActive={false}
        onToggle={() => {}}
        icon="⚙️"
        position={{ top: "2%" }}
      />
    );

    // Check for circle border radius
    const button = screen.getByRole("button");
    expect(button).toHaveStyle("border-radius: 50%");
  });
});
