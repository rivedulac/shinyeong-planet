import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NameEditButton from "../NameEditButton";

vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => {
        if (str === "playerName.edit") return "Change Name";
        return str;
      },
    };
  },
}));

describe("NameEditButton", () => {
  it("should render button with correct text", () => {
    const handleClick = vi.fn();
    render(<NameEditButton onClick={handleClick} />);

    // Check that the button shows the correct text
    const button = screen.getByText("Change Name");
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<NameEditButton onClick={handleClick} />);

    // Click the button
    const button = screen.getByText("Change Name");
    fireEvent.click(button);

    // Check that onClick was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
