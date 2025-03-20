import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ConversationModal from "../ConversationModal";
import { IConversation } from "../../game/npcs/interfaces/IConversation";
import { useGeminiService } from "@/hooks/useGeminiService";

// Mock the useGeminiService hook
vi.mock("@/hooks/useGeminiService", () => ({
  useGeminiService: vi.fn(() => ({
    sendMessage: vi.fn().mockResolvedValue("Mock AI response"),
  })),
}));

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("should toggle between scripted and AI conversation modes", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Start in scripted mode showing the first scripted message
    expect(screen.getByText("This is the first message")).toBeInTheDocument();

    // Find and click the AI mode toggle button
    const toggleButton = screen.getByText("AI Chat");
    fireEvent.click(toggleButton);

    // Should now be in AI mode with initial greeting
    expect(
      screen.getByText(
        "Hello! I'm an AI assistant. How can I help you learn more about Shinyeong?"
      )
    ).toBeInTheDocument();

    // Button text should change
    expect(screen.getByText("Scripted Mode")).toBeInTheDocument();

    // Toggle back to scripted mode
    fireEvent.click(screen.getByText("Scripted Mode"));

    // Should show first scripted message again
    expect(screen.getByText("This is the first message")).toBeInTheDocument();
  });

  it("should render the input form in AI mode", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Switch to AI mode
    fireEvent.click(screen.getByText("AI Chat"));

    // Check for input field and send button
    expect(
      screen.getByPlaceholderText("Ask me anything...")
    ).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("should send message and display AI response", async () => {
    // Set up the mock to track the call
    const mockSendMessage = vi
      .fn()
      .mockResolvedValue("AI response to your question");
    // @ts-ignore: vi namespace error
    (useGeminiService as vi.mock).mockReturnValue({
      sendMessage: mockSendMessage,
    });

    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Switch to AI mode
    fireEvent.click(screen.getByText("AI Chat"));

    // Type a message
    const inputField = screen.getByPlaceholderText("Ask me anything...");
    fireEvent.change(inputField, {
      target: { value: "What is your purpose?" },
    });

    // Send the message
    const sendButton = screen.getByText("Send");
    fireEvent.click(sendButton);

    // Verify the service was called with the correct message
    expect(mockSendMessage).toHaveBeenCalledWith("What is your purpose?");

    // Wait for the response to be displayed
    await waitFor(() => {
      expect(
        screen.getByText("AI response to your question")
      ).toBeInTheDocument();
    });

    // Input should be cleared
    expect(inputField).toHaveValue("");
  });

  it("should show loading state while waiting for AI response", async () => {
    // Set up the mock to delay the response
    const mockSendMessage = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve("Delayed AI response"), 50);
      });
    });
    // @ts-ignore: vi namespace error
    (useGeminiService as vi.mock).mockReturnValue({
      sendMessage: mockSendMessage,
    });

    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Switch to AI mode
    fireEvent.click(screen.getByText("AI Chat"));

    // Type and send a message
    const inputField = screen.getByPlaceholderText("Ask me anything...");
    fireEvent.change(inputField, { target: { value: "Hello AI" } });
    fireEvent.click(screen.getByText("Send"));

    // Loading state should appear
    expect(screen.getByText("Thinking...")).toBeInTheDocument();

    // Wait for the response
    await waitFor(() => {
      expect(screen.getByText("Delayed AI response")).toBeInTheDocument();
    });
  });

  it("should show error message when AI service fails", async () => {
    // Set up the mock to fail
    const mockSendMessage = vi
      .fn()
      .mockRejectedValue(new Error("Service error"));
    // @ts-ignore: vi namespace error
    (useGeminiService as vi.mock).mockReturnValue({
      sendMessage: mockSendMessage,
    });

    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Switch to AI mode
    fireEvent.click(screen.getByText("AI Chat"));

    // Type and send a message
    const inputField = screen.getByPlaceholderText("Ask me anything...");
    fireEvent.change(inputField, { target: { value: "Hello AI" } });
    fireEvent.click(screen.getByText("Send"));

    // Error message should appear
    await waitFor(() => {
      expect(
        screen.getByText("Failed to get AI response. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("should disable Send button when input is empty or loading", () => {
    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Switch to AI mode
    fireEvent.click(screen.getByText("AI Chat"));

    // Send button should be disabled initially (empty input)
    const sendButton = screen.getByText("Send");
    expect(sendButton).toBeDisabled();

    // Type something to enable the button
    const inputField = screen.getByPlaceholderText("Ask me anything...");
    fireEvent.change(inputField, { target: { value: "Hello" } });
    expect(sendButton).not.toBeDisabled();

    // Clear input to disable button again
    fireEvent.change(inputField, { target: { value: "" } });
    expect(sendButton).toBeDisabled();
  });

  it("should not process a message if input is empty", () => {
    const mockSendMessage = vi.fn();
    // @ts-ignore: vi namespace error
    (useGeminiService as vi.mock).mockReturnValue({
      sendMessage: mockSendMessage,
    });

    render(
      <ConversationModal
        conversation={mockConversation}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    // Switch to AI mode
    fireEvent.click(screen.getByText("AI Chat"));

    // Try to submit form with empty input
    const form = screen
      .getByPlaceholderText("Ask me anything...")
      .closest("form");
    fireEvent.submit(form!);

    // Service should not have been called
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
