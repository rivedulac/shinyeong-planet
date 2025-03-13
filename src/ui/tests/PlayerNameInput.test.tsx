import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlayerNameInput from "../PlayerNameInput";

// Mock the translations function
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => {
        // Simple mock implementation
        if (str === "playerName.title") return "Welcome to Shinyeong Planet";
        if (str === "playerName.enterName") return "Please enter your name:";
        if (str === "playerName.placeholder") return "Your name here";
        if (str === "playerName.start") return "Start Journey";
        if (str === "playerName.error") return "Name cannot be empty";
        return str;
      },
    };
  },
}));

describe("PlayerNameInput", () => {
  it("should render player name input form", () => {
    const mockOnNameSubmit = vi.fn();
    render(<PlayerNameInput onNameSubmit={mockOnNameSubmit} />);

    // Check for title
    expect(screen.getByText("Welcome to Shinyeong Planet")).toBeInTheDocument();

    // Check for label
    expect(screen.getByText("Please enter your name:")).toBeInTheDocument();

    // Check for input field
    expect(screen.getByPlaceholderText("Your name here")).toBeInTheDocument();

    // Check for button
    expect(screen.getByText("Start Journey")).toBeInTheDocument();
  });

  it("should show error when submitting with empty name", () => {
    const mockOnNameSubmit = vi.fn();
    render(<PlayerNameInput onNameSubmit={mockOnNameSubmit} />);

    // Get input and button
    const input = screen.getByPlaceholderText("Your name here");
    const button = screen.getByText("Start Journey");

    // Try to submit with an empty name
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(button);

    // Check that error is displayed
    expect(screen.getByText("Name cannot be empty")).toBeInTheDocument();

    // Check that callback was not called
    expect(mockOnNameSubmit).not.toHaveBeenCalled();
  });

  it("should call onNameSubmit when valid name is submitted", () => {
    const mockOnNameSubmit = vi.fn();
    render(<PlayerNameInput onNameSubmit={mockOnNameSubmit} />);

    // Get input and button
    const input = screen.getByPlaceholderText("Your name here");
    const button = screen.getByText("Start Journey");

    // Enter a valid name and submit
    fireEvent.change(input, { target: { value: "J" } });
    fireEvent.click(button);

    // Check that callback was called with the correct name
    expect(mockOnNameSubmit).toHaveBeenCalledWith("J");
  });

  it("should trim whitespace from name when submitting", () => {
    const mockOnNameSubmit = vi.fn();
    render(<PlayerNameInput onNameSubmit={mockOnNameSubmit} />);

    // Get input and button
    const input = screen.getByPlaceholderText("Your name here");
    const button = screen.getByText("Start Journey");

    // Enter a name with whitespace and submit
    fireEvent.change(input, { target: { value: "  Jane Doe  " } });
    fireEvent.click(button);

    // Check that callback was called with trimmed name
    expect(mockOnNameSubmit).toHaveBeenCalledWith("Jane Doe");
  });

  it("should not allow submission of only whitespace", () => {
    const mockOnNameSubmit = vi.fn();
    render(<PlayerNameInput onNameSubmit={mockOnNameSubmit} />);

    // Get input and button
    const input = screen.getByPlaceholderText("Your name here");
    const button = screen.getByText("Start Journey");

    // Enter only whitespace and submit
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(button);

    // Check that error is displayed
    expect(screen.getByText("Name cannot be empty")).toBeInTheDocument();

    // Check that callback was not called
    expect(mockOnNameSubmit).not.toHaveBeenCalled();
  });

  it("should clear error when valid input is entered after error", () => {
    const mockOnNameSubmit = vi.fn();
    render(<PlayerNameInput onNameSubmit={mockOnNameSubmit} />);

    // Get input and button
    const input = screen.getByPlaceholderText("Your name here");
    const button = screen.getByText("Start Journey");

    // Try to submit with an empty name to trigger error
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(button);

    // Check that error is displayed
    expect(screen.getByText("Name cannot be empty")).toBeInTheDocument();

    // Now enter a valid name
    fireEvent.change(input, { target: { value: "A" } });

    // Error should be gone
    expect(screen.queryByText("Name cannot be empty")).not.toBeInTheDocument();
  });
});
