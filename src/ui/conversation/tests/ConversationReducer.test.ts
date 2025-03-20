// src/ui/conversation/tests/ConversationReducer.test.ts
import { describe, it, expect } from "vitest";
import {
  conversationReducer,
  initialConversationState,
  ConversationState,
  ConversationAction,
} from "../ConversationReducer";

describe("conversationReducer", () => {
  it("should return the initial state", () => {
    // @ts-ignore - Testing with invalid action
    const result = conversationReducer(initialConversationState, {});
    expect(result).toEqual(initialConversationState);
  });

  it("should handle NEXT_MESSAGE", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      currentMessageIndex: 1,
    };

    const action: ConversationAction = { type: "NEXT_MESSAGE" };

    const result = conversationReducer(initialState, action);

    expect(result.currentMessageIndex).toBe(2);
  });

  it("should handle PREVIOUS_MESSAGE", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      currentMessageIndex: 2,
    };

    const action: ConversationAction = { type: "PREVIOUS_MESSAGE" };

    const result = conversationReducer(initialState, action);

    expect(result.currentMessageIndex).toBe(1);
  });

  it("should not go below 0 for PREVIOUS_MESSAGE", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      currentMessageIndex: 0,
    };

    const action: ConversationAction = { type: "PREVIOUS_MESSAGE" };

    const result = conversationReducer(initialState, action);

    // Should remain at 0, not go negative
    expect(result.currentMessageIndex).toBe(0);
  });

  it("should handle SET_MESSAGE_INDEX", () => {
    const action: ConversationAction = {
      type: "SET_MESSAGE_INDEX",
      payload: 3,
    };

    const result = conversationReducer(initialConversationState, action);

    expect(result.currentMessageIndex).toBe(3);
  });

  it("should handle SET_USER_INPUT", () => {
    const action: ConversationAction = {
      type: "SET_USER_INPUT",
      payload: "Hello AI",
    };

    const result = conversationReducer(initialConversationState, action);

    expect(result.userInput).toBe("Hello AI");
  });

  it("should handle ADD_AI_RESPONSE", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      userInput: "Test question",
      isLoading: true,
      aiResponses: ["Previous response"],
    };

    const action: ConversationAction = {
      type: "ADD_AI_RESPONSE",
      payload: "Test answer",
    };

    const result = conversationReducer(initialState, action);

    expect(result.aiResponses).toEqual(["Previous response", "Test answer"]);
    expect(result.userInput).toBe(""); // Input should be cleared
    expect(result.isLoading).toBe(false); // Loading should end
    expect(result.error).toBeNull(); // Error should be cleared
    expect(result.currentMessageIndex).toBe(1); // Should point to the new response
  });

  it("should handle TOGGLE_AI_MODE when switching to AI mode first time", () => {
    const result = conversationReducer(initialConversationState, {
      type: "TOGGLE_AI_MODE",
    });

    expect(result.isAiEnabled).toBe(true);
    expect(result.aiResponses).toEqual([
      "Hello! I'm an AI assistant. How can I help you learn more about Shinyeong?",
    ]);
    expect(result.currentMessageIndex).toBe(0);
  });

  it("should handle TOGGLE_AI_MODE when already has responses", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      aiResponses: ["Existing response 1", "Existing response 2"],
      currentMessageIndex: 1,
    };

    const result = conversationReducer(initialState, {
      type: "TOGGLE_AI_MODE",
    });

    expect(result.isAiEnabled).toBe(true);
    expect(result.aiResponses).toEqual([
      "Existing response 1",
      "Existing response 2",
    ]);
    expect(result.currentMessageIndex).toBe(0); // Reset to first message
  });

  it("should handle TOGGLE_AI_MODE when switching back to scripted mode", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      isAiEnabled: true,
      aiResponses: ["Response 1", "Response 2"],
      currentMessageIndex: 1,
    };

    const result = conversationReducer(initialState, {
      type: "TOGGLE_AI_MODE",
    });

    expect(result.isAiEnabled).toBe(false);
    expect(result.aiResponses).toEqual(["Response 1", "Response 2"]); // Responses preserved
    expect(result.currentMessageIndex).toBe(0); // Reset to first message
  });

  it("should handle SET_LOADING", () => {
    const action: ConversationAction = {
      type: "SET_LOADING",
      payload: true,
    };

    const result = conversationReducer(initialConversationState, action);

    expect(result.isLoading).toBe(true);
  });

  it("should handle SET_ERROR", () => {
    const action: ConversationAction = {
      type: "SET_ERROR",
      payload: "Failed to get response",
    };

    const initialState: ConversationState = {
      ...initialConversationState,
      isLoading: true, // Should be turned off when error is set
    };

    const result = conversationReducer(initialState, action);

    expect(result.error).toBe("Failed to get response");
    expect(result.isLoading).toBe(false); // Loading turned off
  });

  it("should clear error when adding AI response", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      error: "Previous error",
    };

    const action: ConversationAction = {
      type: "ADD_AI_RESPONSE",
      payload: "New response",
    };

    const result = conversationReducer(initialState, action);

    expect(result.error).toBeNull();
  });

  it("should clear error when switching conversation modes", () => {
    const initialState: ConversationState = {
      ...initialConversationState,
      error: "Previous error",
    };

    const action: ConversationAction = { type: "TOGGLE_AI_MODE" };

    const result = conversationReducer(initialState, action);

    expect(result.error).toBeNull();
  });
});
