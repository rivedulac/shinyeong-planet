import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConversationModal from "../ConversationModal";
import { IConversation } from "../../game/npcs/IConversation";

describe("ConversationModal", () => {
  const mockConversation: IConversation = {
    title: "Test NPC",
    messages: [
      "This is the first message",
      "This is the second message",
      "This is the third message",
    ],
    icon: "🧪",
  };

  const mockOnClose = vi.fn();

  it("should not render when isOpen is false", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={false}
      />
    );

    // Should not find any elements from the modal
    expect(screen.queryByText("Test NPC")).not.toBeInTheDocument();
  });

  it("should render title, icon and first message when opened", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Should show the title
    expect(screen.getByText("Test NPC")).toBeInTheDocument();

    // Should show the icon
    expect(screen.getByText("🧪")).toBeInTheDocument();

    // Should show the first message
    expect(screen.getByText("This is the first message")).toBeInTheDocument();

    // Should not show other messages yet
    expect(
      screen.queryByText("This is the second message")
    ).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Find and click the close button
    const closeButton = screen.getByLabelText("Close conversation");
    fireEvent.click(closeButton);

    // Should call the onClose function
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should navigate to next message when Next button is clicked", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Initially shows first message
    expect(screen.getByText("This is the first message")).toBeInTheDocument();

    // Find and click the Next button
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Should now show second message
    expect(screen.getByText("This is the second message")).toBeInTheDocument();

    // First message should no longer be visible
    expect(
      screen.queryByText("This is the first message")
    ).not.toBeInTheDocument();
  });

  it("should navigate to previous message when Previous button is clicked", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Go to second message
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Now go back to first message
    const prevButton = screen.getByText("Previous");
    fireEvent.click(prevButton);

    // Should show first message again
    expect(screen.getByText("This is the first message")).toBeInTheDocument();
  });

  it("should disable Previous button on first message", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Find Previous button
    const prevButton = screen.getByText("Previous");

    // Button should be disabled
    expect(prevButton).toHaveAttribute("disabled");
  });

  it("should disable Next button on last message", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Go to the last message
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton); // to second message
    fireEvent.click(nextButton); // to third message

    // Next button should now be disabled
    expect(nextButton).toHaveAttribute("disabled");
  });
});
