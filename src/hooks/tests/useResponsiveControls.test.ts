// src/hooks/tests/useResponsiveControls.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

describe("useResponsiveControls", () => {
  // Store original window properties
  const originalInnerWidth = window.innerWidth;

  // Mock functions for event listeners
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  // Mock setProperty for documentElement.style
  const mockSetProperty = vi.fn();

  beforeEach(() => {
    // Mock window event listeners
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;

    // Mock document.documentElement.style.setProperty
    document.documentElement.style.setProperty = mockSetProperty;
  });

  afterEach(() => {
    // Reset mocks and restore original properties
    vi.clearAllMocks();

    // Restore original window properties
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
  });

  it("should set initial scale based on window width", () => {
    // Test with desktop width
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });
    renderHook(() => useResponsiveControls());
    expect(mockSetProperty).toHaveBeenCalledWith("--control-scale", "1");

    vi.clearAllMocks();

    // Test with mobile width
    Object.defineProperty(window, "innerWidth", { value: 480, writable: true });
    renderHook(() => useResponsiveControls());

    // For 480px width, scale should be 480/768 = 0.625
    // But with Math.max(0.7, ratio), it should be 0.7
    expect(mockSetProperty).toHaveBeenCalledWith("--control-scale", "0.7");

    vi.clearAllMocks();

    // Test with width between mobile and min scale
    Object.defineProperty(window, "innerWidth", { value: 600, writable: true });
    renderHook(() => useResponsiveControls());
    // 600/768 = 0.78125, which is above 0.7 min
    expect(mockSetProperty).toHaveBeenCalledWith("--control-scale", "0.78125");
  });

  it("should add resize event listener on mount", () => {
    renderHook(() => useResponsiveControls());
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("should remove event listener on unmount", () => {
    const { unmount } = renderHook(() => useResponsiveControls());
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("should return the computed scale factor", () => {
    // Test with desktop width
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });
    const { result } = renderHook(() => useResponsiveControls());
    expect(result.current).toBe(1);

    vi.clearAllMocks();

    // Test with mobile width
    Object.defineProperty(window, "innerWidth", { value: 480, writable: true });
    const { result: mobileResult } = renderHook(() => useResponsiveControls());
    expect(mobileResult.current).toBe(0.7);
  });

  it("should handle window resize", () => {
    // Capture the resize handler
    let resizeHandler = () => {};
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "resize") {
        resizeHandler = handler;
      }
    });

    // Initial width - desktop
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });
    const { result, rerender } = renderHook(() => useResponsiveControls());

    // Clear mock to track new calls
    vi.clearAllMocks();

    // Change window width to mobile size
    Object.defineProperty(window, "innerWidth", { value: 480, writable: true });

    // Trigger resize event
    if (resizeHandler) {
      resizeHandler();
      rerender();
    }

    // Should update scale factor for mobile
    expect(mockSetProperty).toHaveBeenCalledWith("--control-scale", "0.7");
    expect(result.current).toBe(0.7);
  });
});
