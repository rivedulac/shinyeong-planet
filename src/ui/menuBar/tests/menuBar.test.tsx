import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MenuBar from "../menuBar";

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string, params: Record<string, string> = {}) => {
        // Simple mock implementation
        if (str === "playerName.display") {
          return `Explorer: ${params.name}`;
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

vi.mock("@/hooks/useResponsiveControls", () => ({
  useResponsiveControls: vi.fn(() => 1.0),
}));

describe("MenuBar", () => {
  it("should render with correct player name", () => {
    render(<MenuBar playerName="TestPlayer" />);

    expect(screen.getByText("Explorer: TestPlayer")).toBeInTheDocument();
  });

  it("should render settings and information icons", () => {
    render(<MenuBar playerName="TestPlayer" />);

    const settingsIcon = screen.getByText("⚙️");
    expect(settingsIcon).toBeInTheDocument();

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

  it("should apply responsive scaling", () => {
    const { container } = render(<MenuBar playerName="TestPlayer" />);

    // Check that the top level div has the transform style
    const topDiv = container.firstChild as HTMLElement;
    expect(topDiv).toHaveStyle("transform: scale(var(--control-scale, 1))");
  });

  it("should have fixed position at top of screen", () => {
    const { container } = render(<MenuBar playerName="TestPlayer" />);

    // Check position styling
    const topDiv = container.firstChild as HTMLElement;
    expect(topDiv).toHaveStyle("position: fixed");
    expect(topDiv).toHaveStyle("top: 0");
    expect(topDiv).toHaveStyle("left: 0");
    expect(topDiv).toHaveStyle("right: 0");
  });

  it("should have proper layout with flex display", () => {
    const { container } = render(<MenuBar playerName="TestPlayer" />);

    // Check display styling
    const topDiv = container.firstChild as HTMLElement;
    expect(topDiv).toHaveStyle("display: flex");
    expect(topDiv).toHaveStyle("justify-content: space-between");
  });

  it("should have proper z-index to appear above other elements", () => {
    const { container } = render(<MenuBar playerName="TestPlayer" />);

    // Check z-index
    const topDiv = container.firstChild as HTMLElement;
    expect(topDiv).toHaveStyle("z-index: 1000");
  });

  it("should display icons on the left and player name on the right", () => {
    const { container } = render(<MenuBar playerName="TestPlayer" />);

    // Get the main div's children
    const topDiv = container.firstChild as HTMLElement;
    const leftSection = topDiv.firstChild as HTMLElement;
    const rightSection = topDiv.lastChild as HTMLElement;

    // Check left section has icons
    expect(leftSection.textContent).toContain("⚙️");
    expect(leftSection.textContent).toContain("ℹ️");

    // Check right section has player name
    expect(rightSection.textContent).toContain("Explorer: TestPlayer");
  });
});
