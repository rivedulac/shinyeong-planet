import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSelector from "../LanguageSelector";

// Mock changeLanguage function
const mockChangeLanguage = vi.fn();

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => {
        // Simple mock implementation
        if (str === "language.title") return "Language";
        if (str === "language.en") return "English";
        if (str === "language.ko") return "한국어";
        if (str === "language.fr") return "Français";
        if (str === "language.zh-CN") return "简体中文";
        if (str === "language.zh-TW") return "繁體中文";
        if (str === "language.de") return "Deutsch";
        if (str === "language.ja") return "日本語";
        return str;
      },
      i18n: {
        changeLanguage: mockChangeLanguage,
        language: "en",
      },
    };
  },
}));

describe("LanguageSelector", () => {
  it("should render language selector with correct options", () => {
    render(<LanguageSelector />);

    // Check that the title is displayed
    expect(screen.getByText("Language")).toBeInTheDocument();

    // Check that the select element exists
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();

    // Check that options exist
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(7); // en, ko, fr, zh-CN, zh-TW, de, ja

    // Verify language names appear
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("한국어")).toBeInTheDocument();
    expect(screen.getByText("Français")).toBeInTheDocument();
    expect(screen.getByText("简体中文")).toBeInTheDocument();
    expect(screen.getByText("繁體中文")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("日本語")).toBeInTheDocument();
  });

  it("should call changeLanguage when selection changes", () => {
    render(<LanguageSelector />);

    // Get select element
    const selectElement = screen.getByRole("combobox");

    // Test a few language changes
    const testLanguages = ["ko", "fr", "zh-CN", "en"];

    testLanguages.forEach((language) => {
      // Change selection
      fireEvent.change(selectElement, { target: { value: language } });
      // Check that changeLanguage was called with the correct language code
      expect(mockChangeLanguage).toHaveBeenCalledWith(language);
    });
  });
});
