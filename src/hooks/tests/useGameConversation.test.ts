import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameConversation } from "../useGameConversation";
import { IConversation } from "../../game/npcs/interfaces/IConversation";

// Mock timers for testing setTimeout
vi.useFakeTimers();

describe("useGameConversation", () => {
  const mockConversation: IConversation = {
    title: "Test Conversation",
    messages: ["Message 1", "Message 2"],
    icon: "🧪",
  };

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should initialize with empty conversation state", () => {
    const { result } = renderHook(() => useGameConversation());

    expect(result.current.currentConversation).toBeNull();
    expect(result.current.isConversationOpen).toBe(false);
  });

  it("should start a conversation", () => {
    const { result } = renderHook(() => useGameConversation());

    act(() => {
      result.current.startConversation(mockConversation);
    });

    expect(result.current.currentConversation).toBe(mockConversation);
    expect(result.current.isConversationOpen).toBe(true);
  });

  it("should end a conversation", () => {
    const { result } = renderHook(() => useGameConversation());

    // Start the conversation first
    act(() => {
      result.current.startConversation(mockConversation);
    });

    // Then end it
    act(() => {
      result.current.endConversation();
    });

    // Conversation should be closed but content still available
    expect(result.current.currentConversation).toBe(mockConversation);
    expect(result.current.isConversationOpen).toBe(false);
  });

  it("should clear conversation data after timeout when ending", () => {
    const { result } = renderHook(() => useGameConversation());

    // Start the conversation
    act(() => {
      result.current.startConversation(mockConversation);
    });

    // End it
    act(() => {
      result.current.endConversation();
    });

    // Before timeout, conversation content should still be there
    expect(result.current.currentConversation).toBe(mockConversation);

    // Advance timers to trigger the cleanup
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // After timeout, conversation content should be cleared
    expect(result.current.currentConversation).toBeNull();
  });

  it("should allow starting a new conversation after ending previous one", () => {
    const { result } = renderHook(() => useGameConversation());
    const newConversation: IConversation = {
      title: "New Conversation",
      messages: ["New Message"],
      icon: "📝",
    };

    // Start and end first conversation
    act(() => {
      result.current.startConversation(mockConversation);
      result.current.endConversation();
    });

    // Fast-forward past the cleanup timeout
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Start a new conversation
    act(() => {
      result.current.startConversation(newConversation);
    });

    // Should have the new conversation
    expect(result.current.currentConversation).toBe(newConversation);
    expect(result.current.isConversationOpen).toBe(true);
  });
});
