import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsDropdown from "../SettingsDropdown";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => {
        // Mock translation strings
        const translations: Record<string, string> = {
          "playerName.edit": "Edit Name",
          "language.title": "Language",
          "language.en": "English",
          "language.ko": "한국어",
          "language.fr": "Français",
          "language.zh-CN": "简体中文",
          "language.zh-TW": "繁體中文",
          "language.de": "Deutsch",
          "language.ja": "日本語",
          "toggle.minimap": "Toggle Minimap",
        };
        return translations[str] || str;
      },
    };
  },
}));

describe("SettingsDropdown", () => {
  it("should not render when isOpen is false", () => {
    render(
      <SettingsDropdown
        isOpen={false}
        onClose={() => {}}
        onEditName={() => {}}
      />
    );

    // Verify that dropdown content is not in the document
    expect(screen.queryByText("Edit Name")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onEditName={() => {}}
      />
    );

    // Verify dropdown content is visible
    expect(screen.getByText("Edit Name")).toBeInTheDocument();
  });

  it("should render the edit name option when onEditName is provided", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onEditName={() => {}}
      />
    );

    // Check for Edit Name option
    expect(screen.getByText("Edit Name")).toBeInTheDocument();
  });

  it("should not render edit name option when onEditName is not provided", () => {
    render(<SettingsDropdown isOpen={true} onClose={() => {}} />);

    // Check that Edit Name option is not rendered
    expect(screen.queryByText("Edit Name")).not.toBeInTheDocument();
  });

  it("should render language options when onChangeLanguage is provided", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onChangeLanguage={() => {}}
        currentLanguage="en"
      />
    );

    // Check language section title is present
    expect(screen.getByText("Language")).toBeInTheDocument();

    // Check some language options are rendered
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("한국어")).toBeInTheDocument();
    expect(screen.getByText("Français")).toBeInTheDocument();
  });

  it("should mark current language with checkmark", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onChangeLanguage={() => {}}
        currentLanguage="en"
      />
    );

    // Check English has a checkmark (✓)
    const englishOption = screen.getByText("English");
    expect(englishOption.parentElement?.textContent).toContain("✓");

    // Other languages should not have a checkmark
    const koreanOption = screen.getByText("한국어");
    expect(koreanOption.parentElement?.textContent).not.toContain("✓");
  });

  it("should call onEditName when edit name option is clicked", () => {
    const mockEditName = vi.fn();
    const mockClose = vi.fn();

    render(
      <SettingsDropdown
        isOpen={true}
        onClose={mockClose}
        onEditName={mockEditName}
      />
    );

    // Click on edit name option
    fireEvent.click(screen.getByText("Edit Name"));

    // Verify callbacks were called
    expect(mockEditName).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should call onChangeLanguage when a language is selected", () => {
    const mockChangeLanguage = vi.fn();
    const mockClose = vi.fn();

    render(
      <SettingsDropdown
        isOpen={true}
        onClose={mockClose}
        onChangeLanguage={mockChangeLanguage}
        currentLanguage="en"
      />
    );

    // Click on Korean language option
    fireEvent.click(screen.getByText("한국어"));

    // Verify callbacks were called with correct language code
    expect(mockChangeLanguage).toHaveBeenCalledWith("ko");
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should render toggle minimap option when onToggleMinimap is provided", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onToggleMinimap={() => {}}
      />
    );

    // Check for Toggle Minimap option
    expect(screen.getByText("Toggle Minimap")).toBeInTheDocument();
  });

  it("should call onToggleMinimap when toggle minimap option is clicked", () => {
    const mockToggleMinimap = vi.fn();
    const mockClose = vi.fn();

    render(
      <SettingsDropdown
        isOpen={true}
        onClose={mockClose}
        onToggleMinimap={mockToggleMinimap}
      />
    );

    // Click on toggle minimap option
    fireEvent.click(screen.getByText("Toggle Minimap"));

    // Verify callbacks were called
    expect(mockToggleMinimap).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
