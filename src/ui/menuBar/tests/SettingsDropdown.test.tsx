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
          "position.reset": "Reset Position",
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

  it("should render language section when onChangeLanguage is provided", () => {
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
  });

  it("should toggle language menu when language title is clicked", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onChangeLanguage={() => {}}
        currentLanguage="en"
      />
    );

    // Language options should not be visible initially
    expect(screen.queryByText("English")).not.toBeInTheDocument();

    // Click on language title to expand
    fireEvent.click(screen.getByText("Language"));

    // Language options should now be visible
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("한국어")).toBeInTheDocument();
  });

  it("should mark current language with checkmark when language menu is open", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onChangeLanguage={() => {}}
        currentLanguage="en"
      />
    );

    // Open language menu
    fireEvent.click(screen.getByText("Language"));

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

    // Open language menu
    fireEvent.click(screen.getByText("Language"));

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

  it("should render reset position option when onResetPosition is provided", () => {
    render(
      <SettingsDropdown
        isOpen={true}
        onClose={() => {}}
        onResetPosition={() => {}}
      />
    );

    // Check for Reset Position option
    expect(screen.getByText("Reset Position")).toBeInTheDocument();
  });

  it("should not render reset position option when onResetPosition is not provided", () => {
    render(<SettingsDropdown isOpen={true} onClose={() => {}} />);

    // Check that Reset Position option is not rendered
    expect(screen.queryByText("Reset Position")).not.toBeInTheDocument();
  });

  it("should call onResetPosition when reset position option is clicked", () => {
    const mockResetPosition = vi.fn();
    const mockClose = vi.fn();

    render(
      <SettingsDropdown
        isOpen={true}
        onClose={mockClose}
        onResetPosition={mockResetPosition}
      />
    );

    // Click on reset position option
    fireEvent.click(screen.getByText("Reset Position"));

    // Verify callbacks were called
    expect(mockResetPosition).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
