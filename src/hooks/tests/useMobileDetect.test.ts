import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMobileDetect } from "../useMobileDetect";

describe("useMobileDetect", () => {
  // Store original navigator and window properties
  const originalNavigator = window.navigator;
  const originalInnerWidth = window.innerWidth;

  // Mock functions for event listeners
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  beforeEach(() => {
    // Mock window event listeners
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
  });

  afterEach(() => {
    // Reset mocks and restore original properties
    vi.clearAllMocks();

    // Use Object.defineProperty on window instead of global
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
  });

  it("should detect mobile user agent", () => {
    // Mobile user agents to test
    const mobileUserAgents = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Mobile Safari/537.36",
      "Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/96.0",
      "Opera/9.80 (Android; Opera Mini/7.5.54678/28.2555; U; ru) Presto/2.10.289 Version/12.02",
    ];

    // Test each mobile user agent
    for (const userAgent of mobileUserAgents) {
      // Create a navigator object with the user agent
      const mockNavigator = {
        ...originalNavigator,
        userAgent: userAgent,
      };

      // Apply the mock navigator
      Object.defineProperty(window, "navigator", {
        value: mockNavigator,
        writable: true,
        configurable: true,
      });

      // Set window width to a desktop size to ensure we're testing the user agent, not the width
      Object.defineProperty(window, "innerWidth", {
        value: 1200,
        writable: true,
        configurable: true,
      });

      // Render the hook
      const { result } = renderHook(() => useMobileDetect());

      // Expect isMobile to be true for mobile user agents
      expect(result.current).toBe(true);
    }
  });

  it("should detect desktop user agent", () => {
    // Desktop user agents to test
    const desktopUserAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
      "Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
    ];

    // Test each desktop user agent
    for (const userAgent of desktopUserAgents) {
      // Create a navigator object with the user agent
      const mockNavigator = {
        ...originalNavigator,
        userAgent: userAgent,
      };

      // Apply the mock navigator
      Object.defineProperty(window, "navigator", {
        value: mockNavigator,
        writable: true,
        configurable: true,
      });

      // Set window width to a desktop size
      Object.defineProperty(window, "innerWidth", {
        value: 1200,
        writable: true,
        configurable: true,
      });

      // Render the hook
      const { result } = renderHook(() => useMobileDetect());

      // Expect isMobile to be false for desktop user agents
      expect(result.current).toBe(false);
    }
  });

  it("should detect mobile based on small screen width", () => {
    // Create a navigator object with desktop user agent
    const mockNavigator = {
      ...originalNavigator,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };

    // Apply the mock navigator
    Object.defineProperty(window, "navigator", {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });

    // But set a mobile-sized window width
    Object.defineProperty(window, "innerWidth", {
      value: 480,
      writable: true,
      configurable: true,
    });

    // Render the hook
    const { result } = renderHook(() => useMobileDetect());

    // Expect isMobile to be true for small screens
    expect(result.current).toBe(true);
  });

  it("should add and remove event listeners", () => {
    // Render the hook
    const { unmount } = renderHook(() => useMobileDetect());

    // Check that resize event listener was added
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    // Unmount the hook
    unmount();

    // Check that resize event listener was removed
    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("should update isMobile when window size changes", () => {
    // Create a navigator object with desktop user agent
    const mockNavigator = {
      ...originalNavigator,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };

    // Apply the mock navigator
    Object.defineProperty(window, "navigator", {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });

    // Set initial window width (desktop size)
    Object.defineProperty(window, "innerWidth", {
      value: 1200,
      writable: true,
      configurable: true,
    });

    // Capture the resize handler
    let resizeHandler = () => {};
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "resize") {
        resizeHandler = handler;
      }
    });

    // Render the hook
    const { result, rerender } = renderHook(() => useMobileDetect());

    // Initially it should be desktop
    expect(result.current).toBe(false);

    // Change window width to mobile size
    Object.defineProperty(window, "innerWidth", {
      value: 600,
      writable: true,
      configurable: true,
    });

    // Trigger the resize event
    if (resizeHandler) {
      resizeHandler();
      rerender();
    }

    // Now it should detect as mobile
    expect(result.current).toBe(true);
  });
});
