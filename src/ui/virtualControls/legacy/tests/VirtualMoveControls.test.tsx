import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VirtualMoveControls from "../VirtualMoveControls";

describe("VirtualMoveControls", () => {
  it("should render eight directional buttons", () => {
    render(<VirtualMoveControls onMoveStart={() => {}} onMoveEnd={() => {}} />);
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByTestId("up-arrow-button")).toBeInTheDocument();
    expect(screen.getByTestId("down-arrow-button")).toBeInTheDocument();
    expect(screen.getByTestId("left-arrow-button")).toBeInTheDocument();
    expect(screen.getByTestId("right-arrow-button")).toBeInTheDocument();
  });

  it("should call onMoveStart when a button is pressed", () => {
    const mockMoveStart = vi.fn();
    render(
      <VirtualMoveControls onMoveStart={mockMoveStart} onMoveEnd={() => {}} />
    );

    // Find the W button and click it
    const wButton = screen.getByText("W");
    fireEvent.mouseDown(wButton);

    // Check that onMoveStart was called with "w"
    expect(mockMoveStart).toHaveBeenCalledWith("w");
  });

  it("should call onMoveEnd when a button is released", () => {
    const mockMoveEnd = vi.fn();
    render(
      <VirtualMoveControls onMoveStart={() => {}} onMoveEnd={mockMoveEnd} />
    );

    // Find the S button, press it and release it
    const sButton = screen.getByText("S");
    fireEvent.mouseDown(sButton);
    fireEvent.mouseUp(sButton);

    // Check that onMoveEnd was called with "s"
    expect(mockMoveEnd).toHaveBeenCalledWith("s");
  });

  it("should call onMoveEnd when mouse leaves a pressed button", () => {
    const mockMoveEnd = vi.fn();
    render(
      <VirtualMoveControls onMoveStart={() => {}} onMoveEnd={mockMoveEnd} />
    );

    // Find the D button, press it and move away
    const dButton = screen.getByText("D");
    fireEvent.mouseDown(dButton);
    fireEvent.mouseLeave(dButton);

    // Check that onMoveEnd was called with "d"
    expect(mockMoveEnd).toHaveBeenCalledWith("d");
  });

  it("should handle multiple buttons being pressed", () => {
    const mockMoveStart = vi.fn();
    render(
      <VirtualMoveControls onMoveStart={mockMoveStart} onMoveEnd={() => {}} />
    );

    // Press multiple buttons
    fireEvent.mouseDown(screen.getByText("W"));
    fireEvent.mouseDown(screen.getByText("D"));

    // Check that onMoveStart was called for each button
    expect(mockMoveStart).toHaveBeenCalledTimes(2);
    expect(mockMoveStart).toHaveBeenNthCalledWith(1, "w");
    expect(mockMoveStart).toHaveBeenNthCalledWith(2, "d");
  });
});
