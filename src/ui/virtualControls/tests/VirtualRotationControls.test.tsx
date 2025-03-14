import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VirtualRotationControls from "../VirtualRotationControls";

describe("VirtualRotationControls", () => {
  const mockRotateStart = vi.fn();
  const mockRotateEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render four rotation buttons with arrows", () => {
    render(
      <VirtualRotationControls
        onRotateStart={mockRotateStart}
        onRotateEnd={mockRotateEnd}
      />
    );

    // Check that all four buttons are rendered with arrow symbols
    expect(screen.getByText("↑")).toBeInTheDocument();
    expect(screen.getByText("←")).toBeInTheDocument();
    expect(screen.getByText("↓")).toBeInTheDocument();
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  it("should call onRotateStart when a button is pressed", () => {
    render(
      <VirtualRotationControls
        onRotateStart={mockRotateStart}
        onRotateEnd={mockRotateEnd}
      />
    );

    // Find the Up button and click it
    const upButton = screen.getByText("↑");
    fireEvent.mouseDown(upButton);

    // Check that onRotateStart was called with "ArrowUp"
    expect(mockRotateStart).toHaveBeenCalledWith("ArrowUp");
  });

  it("should call onRotateEnd when a button is released", () => {
    render(
      <VirtualRotationControls
        onRotateStart={mockRotateStart}
        onRotateEnd={mockRotateEnd}
      />
    );

    // Find the Left button, press it and release it
    const leftButton = screen.getByText("←");
    fireEvent.mouseDown(leftButton);
    fireEvent.mouseUp(leftButton);

    // Check that onRotateEnd was called with "ArrowLeft"
    expect(mockRotateEnd).toHaveBeenCalledWith("ArrowLeft");
  });

  it("should handle all rotation directions", () => {
    render(
      <VirtualRotationControls
        onRotateStart={mockRotateStart}
        onRotateEnd={mockRotateEnd}
      />
    );

    // Test each direction button
    const directions = [
      { button: "↑", key: "ArrowUp" },
      { button: "←", key: "ArrowLeft" },
      { button: "↓", key: "ArrowDown" },
      { button: "→", key: "ArrowRight" },
    ];

    directions.forEach(({ button, key }) => {
      const btn = screen.getByText(button);
      fireEvent.mouseDown(btn);
      expect(mockRotateStart).toHaveBeenCalledWith(key);
      fireEvent.mouseUp(btn);
      expect(mockRotateEnd).toHaveBeenCalledWith(key);
    });

    // Check that each function was called 4 times (once for each direction)
    expect(mockRotateStart).toHaveBeenCalledTimes(4);
    expect(mockRotateEnd).toHaveBeenCalledTimes(4);
  });
});
