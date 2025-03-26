import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VirtualControlPad, {
  MOVE_THRESHOLD,
  LOOK_THRESHOLD,
  ROTATE_THRESHOLD,
} from "../VirtualPad";

describe("VirtualControlPad", () => {
  const mockMoveStart = vi.fn();
  const mockMoveEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the control pad with center circle", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    // Check that the control pad container exists
    const controlPad = screen.getByTestId("virtual-pad");
    expect(controlPad).toBeInTheDocument();

    // Check that the center circle is rendered
    const centerCircle = controlPad.querySelector("div > div");
    expect(centerCircle).toHaveStyle("border-radius: 50%");
  });

  it("should not show the position indicator when inactive", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");
    // There should only be one child div (the center circle) when inactive
    expect(controlPad.querySelectorAll("div > div").length).toBe(1);
  });

  it("should show position indicator when active", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Simulate mouse down to activate
    fireEvent.mouseDown(controlPad);

    // Now there should be two child divs (center + position indicator)
    expect(controlPad.querySelectorAll("div > div").length).toBe(2);
  });

  it("should call onMoveStart with 'w' when moving forward (upper center)", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect to return consistent dimensions
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Simulate mouse down near the top center
    // Within MOVE_THRESHOLD for X and negative Y (upper half)
    const centerX = 150;
    const moveX = centerX; // Center X (no horizontal movement)
    const moveY = 40; // Upper area but not beyond LOOK_THRESHOLD

    fireEvent.mouseDown(controlPad, { clientX: moveX, clientY: moveY });

    // Should trigger the 'w' key (forward movement)
    expect(mockMoveStart).toHaveBeenCalledWith("forward");

    // Should not trigger look up (not beyond LOOK_THRESHOLD)
    expect(mockMoveStart).not.toHaveBeenCalledWith("up");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should call onMoveStart with 'arrowup' when looking up (extreme top)", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Calculate a Y position that exceeds LOOK_THRESHOLD
    const centerY = 100;
    const lookY = centerY - centerY * LOOK_THRESHOLD - 10; // Beyond look threshold

    // Simulate mouse down at extreme top (should trigger look up)
    fireEvent.mouseDown(controlPad, { clientX: 150, clientY: lookY });

    // Should trigger the 'arrowup' key (look up)
    expect(mockMoveStart).toHaveBeenCalledWith("up");

    // Also should trigger forward movement
    expect(mockMoveStart).toHaveBeenCalledWith("forward");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should call onMoveStart with 's' when moving backward (lower center)", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Simulate mouse down at lower center
    // Within MOVE_THRESHOLD for X and positive Y (lower half)
    const centerX = 150;
    const moveX = centerX; // Center X (no horizontal movement)
    const moveY = 160; // Lower area but not beyond LOOK_THRESHOLD

    fireEvent.mouseDown(controlPad, { clientX: moveX, clientY: moveY });

    // Should trigger the 's' key (backward movement)
    expect(mockMoveStart).toHaveBeenCalledWith("backward");

    // Should not trigger look down (not beyond LOOK_THRESHOLD)
    expect(mockMoveStart).not.toHaveBeenCalledWith("down");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should call onMoveStart with 'arrowdown' when looking down (extreme bottom)", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Calculate a Y position that exceeds LOOK_THRESHOLD
    const centerY = 100;
    const lookY = centerY + centerY * LOOK_THRESHOLD + 10; // Beyond look threshold

    // Simulate mouse down at extreme bottom (should trigger look down)
    fireEvent.mouseDown(controlPad, { clientX: 150, clientY: lookY });

    // Should trigger the 'arrowdown' key (look down)
    expect(mockMoveStart).toHaveBeenCalledWith("down");

    // Also should trigger backward movement
    expect(mockMoveStart).toHaveBeenCalledWith("backward");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should call onMoveStart with 'arrowleft' when moving left", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Calculate an X position that exceeds ROTATE_THRESHOLD to the left
    const centerX = 150;
    const rotateX = centerX - centerX * ROTATE_THRESHOLD - 10; // Beyond rotate threshold

    // Simulate mouse down on the left
    fireEvent.mouseDown(controlPad, { clientX: rotateX, clientY: 100 });

    // Should trigger the 'arrowleft' key
    expect(mockMoveStart).toHaveBeenCalledWith("left");

    // Should NOT trigger forward/backward when beyond MOVE_THRESHOLD
    expect(mockMoveStart).not.toHaveBeenCalledWith("forward");
    expect(mockMoveStart).not.toHaveBeenCalledWith("backward");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should call onMoveStart with 'arrowright' when moving right", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Calculate an X position that exceeds ROTATE_THRESHOLD to the right
    const centerX = 150;
    const rotateX = centerX + centerX * ROTATE_THRESHOLD + 10; // Beyond rotate threshold

    // Simulate mouse down on the right
    fireEvent.mouseDown(controlPad, { clientX: rotateX, clientY: 100 });

    // Should trigger the 'arrowright' key
    expect(mockMoveStart).toHaveBeenCalledWith("right");

    // Should NOT trigger forward/backward when beyond MOVE_THRESHOLD
    expect(mockMoveStart).not.toHaveBeenCalledWith("forward");
    expect(mockMoveStart).not.toHaveBeenCalledWith("backward");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should recognize combined movements (forward + right)", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Calculate a position within MOVE_THRESHOLD for X-axis (forward/backward allowed)
    // but exceeding ROTATE_THRESHOLD (to trigger rotation)
    const centerX = 150;
    const centerY = 100;
    // Position halfway between MOVE_THRESHOLD and ROTATE_THRESHOLD
    const moveX = centerX + centerX * ((MOVE_THRESHOLD + ROTATE_THRESHOLD) / 2);
    const moveY = centerY + 40; // Upper half for forward

    // Simulate mouse down at upper-right
    fireEvent.mouseDown(controlPad, { clientX: moveX, clientY: moveY });

    // Since X is within MOVE_THRESHOLD and ROTATE_THRESHOLD range, only right rotation should happen
    expect(mockMoveStart).toHaveBeenCalledWith("right");
    expect(mockMoveStart).not.toHaveBeenCalledWith("forward");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should call onMoveEnd for all active directions when released", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Position directly above center (should trigger forward)
    fireEvent.mouseDown(controlPad, { clientX: 150, clientY: 40 });
    expect(mockMoveStart).toHaveBeenCalledWith("forward");

    // Clear mocks to check just the end events
    mockMoveStart.mockClear();

    // Simulate mouse up to release
    fireEvent.mouseUp(controlPad);

    // Should end the active direction
    expect(mockMoveEnd).toHaveBeenCalledWith("forward");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should call onMoveEnd when mouse leaves while active", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Position far left (should trigger left rotation)
    fireEvent.mouseDown(controlPad, { clientX: 50, clientY: 100 });
    expect(mockMoveStart).toHaveBeenCalledWith("left");

    // Clear mocks to check just the end events
    mockMoveStart.mockClear();

    // Simulate mouse leave
    fireEvent.mouseLeave(controlPad);

    // Should end the active direction
    expect(mockMoveEnd).toHaveBeenCalledWith("left");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should handle touch events", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Create a mock touch event for the upper right area
    const touchStartEvent = {
      touches: [{ clientX: 250, clientY: 50 }],
      preventDefault: vi.fn(),
    };

    // Simulate touch start
    fireEvent.touchStart(controlPad, touchStartEvent);

    // Should trigger right rotation (X position far right)
    // Should also trigger forward (Y position in upper half)
    expect(mockMoveStart).toHaveBeenCalledWith("right");

    // Clear mocks
    mockMoveStart.mockClear();

    // Simulate touch end
    fireEvent.touchEnd(controlPad);

    // Should end the active direction
    expect(mockMoveEnd).toHaveBeenCalledWith("right");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should update directions when touch/mouse position changes", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Mock the getBoundingClientRect
    const originalGetBoundingClientRect = controlPad.getBoundingClientRect;
    controlPad.getBoundingClientRect = vi.fn(() => ({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));

    // Start with left and lower position (should trigger left rotation and backward)
    fireEvent.mouseDown(controlPad, { clientX: 50, clientY: 150 });

    // Should trigger 'arrowleft' only, since X is too far left for backward
    expect(mockMoveStart).toHaveBeenCalledWith("left");

    // Clear mocks
    mockMoveStart.mockClear();
    mockMoveEnd.mockClear();

    // Now move to top-center (should trigger forward)
    fireEvent.mouseMove(controlPad, { clientX: 150, clientY: 50 });

    // Should end the previous direction
    expect(mockMoveEnd).toHaveBeenCalledWith("left");

    // And start the new direction
    expect(mockMoveStart).toHaveBeenCalledWith("forward");

    // Restore original method
    controlPad.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("should not respond to mouse movements when inactive", () => {
    render(
      <VirtualControlPad onMoveStart={mockMoveStart} onMoveEnd={mockMoveEnd} />
    );

    const controlPad = screen.getByTestId("virtual-pad");

    // Simulate mouse move without prior mouseDown
    fireEvent.mouseMove(controlPad, { clientX: 150, clientY: 50 });

    // Should not trigger any direction changes
    expect(mockMoveStart).not.toHaveBeenCalled();
    expect(mockMoveEnd).not.toHaveBeenCalled();
  });
});
