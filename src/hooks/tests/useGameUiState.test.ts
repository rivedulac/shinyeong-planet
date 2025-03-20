import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameUiState } from "../useGameUiState";
import { useState } from "react";

// Mock the useLocalStorage hook
vi.mock("../useLocalStorage", () => ({
  default: vi.fn().mockImplementation((key, initialValue) => {
    // Simple mock of localStorage behavior
    const [value, setValue] = useState(initialValue);
    return [value, setValue];
  }),
}));

describe("useGameUiState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useGameUiState());

    expect(result.current.showControlsInfo).toBe(false);
    expect(result.current.showCameraInfo).toBe(false);
    expect(result.current.minimapVisible).toBe(true);
    expect(result.current.isEditingName).toBe(false);
  });

  it("should toggle controls info", () => {
    const { result } = renderHook(() => useGameUiState());

    // Initially off
    expect(result.current.showControlsInfo).toBe(false);

    // Toggle on
    act(() => {
      result.current.toggleControlsInfo();
    });
    expect(result.current.showControlsInfo).toBe(true);

    // Toggle off
    act(() => {
      result.current.toggleControlsInfo();
    });
    expect(result.current.showControlsInfo).toBe(false);
  });

  it("should toggle camera info", () => {
    const { result } = renderHook(() => useGameUiState());

    // Initially off
    expect(result.current.showCameraInfo).toBe(false);

    // Toggle on
    act(() => {
      result.current.toggleCameraInfo();
    });
    expect(result.current.showCameraInfo).toBe(true);

    // Toggle off
    act(() => {
      result.current.toggleCameraInfo();
    });
    expect(result.current.showCameraInfo).toBe(false);
  });

  it("should toggle minimap visibility", () => {
    const { result } = renderHook(() => useGameUiState());

    // Initially on (default)
    expect(result.current.minimapVisible).toBe(true);

    // Toggle off
    act(() => {
      result.current.toggleMinimap();
    });
    expect(result.current.minimapVisible).toBe(false);

    // Toggle back on
    act(() => {
      result.current.toggleMinimap();
    });
    expect(result.current.minimapVisible).toBe(true);
  });

  it("should set editing name state", () => {
    const { result } = renderHook(() => useGameUiState());

    // Initially not editing
    expect(result.current.isEditingName).toBe(false);

    // Set to editing
    act(() => {
      result.current.setEditingName(true);
    });
    expect(result.current.isEditingName).toBe(true);

    // Set back to not editing
    act(() => {
      result.current.setEditingName(false);
    });
    expect(result.current.isEditingName).toBe(false);
  });

  it("should hide camera info when showing controls info", () => {
    const { result } = renderHook(() => useGameUiState());

    // Turn on camera info
    act(() => {
      result.current.toggleCameraInfo();
    });
    expect(result.current.showCameraInfo).toBe(true);

    // Turn on controls info - should hide camera info
    act(() => {
      result.current.toggleControlsInfo();
    });
    expect(result.current.showControlsInfo).toBe(true);
    expect(result.current.showCameraInfo).toBe(false);
  });

  it("should not affect camera info when toggling controls info off", () => {
    const { result } = renderHook(() => useGameUiState());

    // First toggle controls info on
    act(() => {
      result.current.toggleControlsInfo();
    });

    // Then turn it off
    act(() => {
      result.current.toggleControlsInfo();
    });

    // Camera info should still be off (not affected)
    expect(result.current.showControlsInfo).toBe(false);
    expect(result.current.showCameraInfo).toBe(false);
  });
});
