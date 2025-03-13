import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerNameDisplay from "../PlayerNameDisplay";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string, params: Record<string, unknown> = {}) => {
        // Simple mock implementation
        if (str === "playerName.display") return `Explorer: ${params.name}`;
        return str;
      },
    };
  },
}));

describe("PlayerNameDisplay", () => {
  it("should render player name", () => {
    render(<PlayerNameDisplay name="TestPlayer" />);

    // Check that the player name is displayed with the correct format
    expect(screen.getByText("Explorer: TestPlayer")).toBeInTheDocument();
  });

  it("should render with long player names", () => {
    render(<PlayerNameDisplay name="ThisIsAVeryLongPlayerNameForTesting" />);

    // Check that the long player name is displayed
    expect(
      screen.getByText("Explorer: ThisIsAVeryLongPlayerNameForTesting")
    ).toBeInTheDocument();
  });

  it("should render with special characters in player name", () => {
    render(<PlayerNameDisplay name="Player_123!@#" />);

    // Check that the name with special characters is displayed correctly
    expect(screen.getByText("Explorer: Player_123!@#")).toBeInTheDocument();
  });

  it("should render with single character names", () => {
    render(<PlayerNameDisplay name="X" />);

    // Check that single character names display correctly
    expect(screen.getByText("Explorer: X")).toBeInTheDocument();
  });
});
