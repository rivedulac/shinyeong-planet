import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MenuBar from "../MenuBar";

vi.mock("../SettingsDropdown", () => ({
  default: ({
    isOpen,
    onClose,
    onEditName,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onEditName: () => void;
    onToggleControls: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="settings-dropdown">
        {onEditName && (
          <div
            onClick={() => {
              onEditName();
              onClose();
            }}
          >
            Edit Name
          </div>
        )}
        <div>Language Settings</div>
      </div>
    );
  },
}));

vi.mock("../InfoDropdown", () => ({
  default: ({
    isOpen,
    onClose,
    onToggleControls,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onToggleControls: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="info-dropdown">
        {onToggleControls && (
          <div
            onClick={() => {
              onToggleControls();
              onClose();
            }}
          >
            Game Controls
          </div>
        )}
      </div>
    );
  },
}));

// Mock the translation functions
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string, params: Record<string, string> = {}) => {
        // Simple mock implementation
        if (str === "playerName.display") {
          return `Explorer: ${params.name}`;
        }
        if (str.startsWith("language.")) {
          const langCode = str.split(".")[1];
          return (
            {
              en: "English",
              ko: "한국어",
              fr: "Français",
              "zh-CN": "简体中文",
              "zh-TW": "繁體中文",
              de: "Deutsch",
              ja: "日本語",
            }[langCode] || langCode
          );
        }
        return str;
      },
      i18n: {
        language: "en",
        changeLanguage: vi.fn(),
      },
    };
  },
}));

// Mock the useResponsiveControls hook
vi.mock("@/hooks/useResponsiveControls", () => ({
  useResponsiveControls: vi.fn(() => 1.0),
}));

describe("MenuBar", () => {
  it("should render with correct player name", () => {
    render(<MenuBar playerName="TestPlayer" />);

    // Check that player name is displayed correctly
    expect(screen.getByText("Explorer: TestPlayer")).toBeInTheDocument();
  });

  it("should render settings and information icons", () => {
    render(<MenuBar playerName="TestPlayer" />);

    // Check for settings icon
    const settingsIcon = screen.getByText("⚙️");
    expect(settingsIcon).toBeInTheDocument();

    // Check for information icon
    const infoIcon = screen.getByText("ℹ️");
    expect(infoIcon).toBeInTheDocument();
  });

  it("should handle empty player name", () => {
    render(<MenuBar playerName="" />);

    // Should still render the menu bar without player name
    const settingsIcon = screen.getByText("⚙️");
    expect(settingsIcon).toBeInTheDocument();

    // Check that player name element is not rendered at all
    const playerNameElement = screen.queryByText(/Explorer:/);
    expect(playerNameElement).not.toBeInTheDocument();

    // Right section should still exist but be empty
    const { container } = render(<MenuBar playerName="" />);
    const topDiv = container.firstChild as HTMLElement;
    const rightSection = topDiv.lastChild as HTMLElement;
    expect(rightSection.children.length).toBe(0);
  });

  it("should toggle settings dropdown when settings icon is clicked", () => {
    const mockEditName = vi.fn();
    render(
      <MenuBar
        playerName="TestPlayer"
        onEditName={mockEditName}
        onChangeLanguage={vi.fn()}
      />
    );

    // Settings dropdown should be hidden initially
    expect(screen.queryByTestId("settings-dropdown")).not.toBeInTheDocument();

    // Click settings icon
    const settingsIcon = screen.getByText("⚙️");
    fireEvent.click(settingsIcon);

    // Settings dropdown should now be visible
    expect(screen.getByTestId("settings-dropdown")).toBeInTheDocument();
    expect(screen.getByText("Edit Name")).toBeInTheDocument();
  });

  it("should toggle info dropdown when info icon is clicked", () => {
    const mockToggleControls = vi.fn();
    render(
      <MenuBar playerName="TestPlayer" onToggleControls={mockToggleControls} />
    );

    // Info dropdown should be hidden initially
    expect(screen.queryByTestId("info-dropdown")).not.toBeInTheDocument();

    // Click info icon
    const infoIcon = screen.getByText("ℹ️");
    fireEvent.click(infoIcon);

    // Info dropdown should now be visible
    expect(screen.getByTestId("info-dropdown")).toBeInTheDocument();
    expect(screen.getByText("Game Controls")).toBeInTheDocument();
  });

  it("should close settings dropdown when info icon is clicked", () => {
    render(
      <MenuBar
        playerName="TestPlayer"
        onEditName={vi.fn()}
        onToggleControls={vi.fn()}
      />
    );

    // Open settings dropdown
    const settingsIcon = screen.getByText("⚙️");
    fireEvent.click(settingsIcon);

    // Verify settings dropdown is open
    expect(screen.getByTestId("settings-dropdown")).toBeInTheDocument();

    // Click info icon
    const infoIcon = screen.getByText("ℹ️");
    fireEvent.click(infoIcon);

    // Settings dropdown should be closed, info dropdown open
    expect(screen.queryByTestId("settings-dropdown")).not.toBeInTheDocument();
    expect(screen.getByTestId("info-dropdown")).toBeInTheDocument();
  });

  it("should call onEditName when player name is clicked", () => {
    const mockEditName = vi.fn();
    render(<MenuBar playerName="TestPlayer" onEditName={mockEditName} />);

    // Find and click the player name
    const playerName = screen.getByText("Explorer: TestPlayer");
    fireEvent.click(playerName);

    // Check that onEditName was called
    expect(mockEditName).toHaveBeenCalledTimes(1);
  });
});
