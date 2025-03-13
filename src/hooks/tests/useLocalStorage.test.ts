import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useLocalStorage from "../useLocalStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => {
      return Object.keys(store)[index] || null;
    }),
    length: 0, // Not really used but needed for the interface
  };
})();

// Mock the window.addEventListener for storage events
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Setup before tests
beforeEach(() => {
  // Replace the real localStorage with our mock
  Object.defineProperty(window, "localStorage", { value: localStorageMock });

  // Replace addEventListener and removeEventListener methods
  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;

  // Clear our mock localStorage before each test
  localStorageMock.clear();
});

// Clean up after tests
afterEach(() => {
  vi.clearAllMocks();
});

describe("useLocalStorage", () => {
  it("should use the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));

    expect(result.current[0]).toBe("initial");
    expect(localStorageMock.getItem).toHaveBeenCalledWith("testKey");
  });

  it("should load the stored value if it exists", () => {
    // Pre-set a value in localStorage
    localStorageMock.setItem("testKey", JSON.stringify("stored value"));

    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));

    expect(result.current[0]).toBe("stored value");
  });

  it("should update the value and localStorage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));

    // Set a new value
    act(() => {
      result.current[1]("new value");
    });

    // Check the returned value was updated
    expect(result.current[0]).toBe("new value");

    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "testKey",
      JSON.stringify("new value")
    );
  });

  it("should handle complex objects", () => {
    const complexObject = {
      name: "Test",
      score: 42,
      items: ["sword", "shield"],
    };

    const { result } = renderHook(() =>
      useLocalStorage("objectKey", complexObject)
    );

    // Initial value should be the complex object
    expect(result.current[0]).toEqual(complexObject);

    // Update the object
    const updatedObject = {
      ...complexObject,
      score: 100,
      items: [...complexObject.items, "potion"],
    };

    act(() => {
      result.current[1](updatedObject);
    });

    // Check the returned value was updated
    expect(result.current[0]).toEqual(updatedObject);

    // Check localStorage was updated with the stringified object
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "objectKey",
      JSON.stringify(updatedObject)
    );
  });

  it("should handle localStorage.getItem errors gracefully", () => {
    // Mock console.warn to prevent test output noise
    const originalWarn = console.warn;
    console.warn = vi.fn();

    // Make getItem throw an error
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error("getItem error");
    });

    const { result } = renderHook(() => useLocalStorage("testKey", "fallback"));

    // Should use the initial value when localStorage fails
    expect(result.current[0]).toBe("fallback");
    expect(console.warn).toHaveBeenCalled();

    // Restore console.warn
    console.warn = originalWarn;
  });

  it("should handle localStorage.setItem errors gracefully", () => {
    // Mock console.warn to prevent test output noise
    const originalWarn = console.warn;
    console.warn = vi.fn();

    // Make setItem throw an error
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("setItem error");
    });

    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));

    // Attempt to set a value (which will fail)
    act(() => {
      result.current[1]("new value");
    });

    // Internal state should be updated even if localStorage fails
    expect(result.current[0]).toBe("new value");
    expect(console.warn).toHaveBeenCalled();

    // Restore console.warn
    console.warn = originalWarn;
  });
});
