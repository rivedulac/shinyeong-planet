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
        if (str === "language.ko") return "Korean";
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
    expect(options.length).toBe(2); // en, ko

    // Verify language names appear
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Korean")).toBeInTheDocument();
  });

  it("should call changeLanguage when selection changes", () => {
    render(<LanguageSelector />);

    // Get select element
    const selectElement = screen.getByRole("combobox");

    // Change selection to Korean
    fireEvent.change(selectElement, { target: { value: "ko" } });

    // Check that changeLanguage was called with the correct language code
    expect(mockChangeLanguage).toHaveBeenCalledWith("ko");

    // Change selection back to English
    fireEvent.change(selectElement, { target: { value: "en" } });

    // Check that changeLanguage was called with the correct language code
    expect(mockChangeLanguage).toHaveBeenCalledWith("en");
  });
});
