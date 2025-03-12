import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import TitleUpdater from "../TitleUpdater";

// Mock translations
const mockT = vi.fn((key) => {
  if (key === "gameName") return "Shinyeong Planet";
  return key;
});

// Mock i18n object
const mockI18n = {
  language: "en",
  changeLanguage: vi.fn(),
};

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: mockT,
      i18n: mockI18n,
    };
  },
}));

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
console.log = vi.fn();

describe("TitleUpdater", () => {
  let originalTitle: string;

  beforeEach(() => {
    // Save original document title
    originalTitle = document.title;
  });

  afterEach(() => {
    // Restore original document title after each test
    document.title = originalTitle;
    vi.clearAllMocks();
  });

  it("should update document title based on translation", () => {
    render(<TitleUpdater />);

    // Check that t was called with the correct key
    expect(mockT).toHaveBeenCalledWith("gameName");

    // Check that document title was updated
    expect(document.title).toBe("Shinyeong Planet");
  });

  it("should log language change", () => {
    const spyConsoleLog = vi.spyOn(console, "log");
    render(<TitleUpdater />);

    // Check that console.log was called with language information
    expect(spyConsoleLog).toHaveBeenCalledWith("Language changed to:", "en");
  });

  it("should re-render when language changes", () => {
    const spyConsoleLog = vi.spyOn(console, "log");
    const { rerender } = render(<TitleUpdater />);

    // Clear mocks to track new calls
    vi.clearAllMocks();

    // Simulate language change
    mockI18n.language = "ko";
    mockT.mockImplementation((key) => {
      if (key === "gameName") return "신영 행성";
      return key;
    });

    // Re-render component to trigger useEffect
    rerender(<TitleUpdater />);

    // Check that t was called again
    expect(mockT).toHaveBeenCalledWith("gameName");

    // Check that document title was updated to Korean version
    expect(document.title).toBe("신영 행성");

    // Check that language change was logged
    expect(spyConsoleLog).toHaveBeenCalledWith("Language changed to:", "ko");
  });
});

// Restore original console.log after tests
afterEach(() => {
  console.log = originalConsoleLog;
});
