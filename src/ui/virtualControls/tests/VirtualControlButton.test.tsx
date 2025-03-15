import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VirtualControlButton from "../VirtualControlButton";

describe("VirtualControlButton", () => {
  const mockTouchStart = vi.fn();
  const mockTouchEnd = vi.fn();
  const defaultProps = {
    label: "Test",
    position: { top: "10px", left: "10px" },
    onTouchStart: mockTouchStart,
    onTouchEnd: mockTouchEnd,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with the correct label", () => {
    render(<VirtualControlButton {...defaultProps} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should call onTouchStart when pressed", () => {
    render(<VirtualControlButton {...defaultProps} />);
    const button = screen.getByText("Test");
    fireEvent.mouseDown(button);
    expect(mockTouchStart).toHaveBeenCalledTimes(1);
  });

  it("should call onTouchEnd when released", () => {
    render(<VirtualControlButton {...defaultProps} />);
    const button = screen.getByText("Test");
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockTouchEnd).toHaveBeenCalledTimes(1);
  });

  it("should call onTouchEnd when mouse leaves while pressed", () => {
    render(<VirtualControlButton {...defaultProps} />);
    const button = screen.getByText("Test");
    fireEvent.mouseDown(button);
    fireEvent.mouseLeave(button);
    expect(mockTouchEnd).toHaveBeenCalledTimes(1);
  });

  it("should render with custom colors", () => {
    render(
      <VirtualControlButton
        {...defaultProps}
        color="rgba(0, 0, 255, 0.5)"
        pressedColor="rgba(255, 0, 0, 0.5)"
      />
    );

    const button = screen.getByText("Test");
    expect(button).toHaveStyle("background-color: rgba(0, 0, 255, 0.5)");

    // Test pressed state color change
    fireEvent.mouseDown(button);
    expect(button).toHaveStyle("background-color: rgba(255, 0, 0, 0.5)");
  });
});
