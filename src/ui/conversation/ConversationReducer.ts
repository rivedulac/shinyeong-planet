// Define the conversation state
export interface ConversationState {
  currentMessageIndex: number;
  userInput: string;
  aiResponses: string[];
  isAiEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define possible actions
export type ConversationAction =
  | { type: "NEXT_MESSAGE" }
  | { type: "PREVIOUS_MESSAGE" }
  | { type: "SET_MESSAGE_INDEX"; payload: number }
  | { type: "SET_USER_INPUT"; payload: string }
  | { type: "ADD_AI_RESPONSE"; payload: string }
  | { type: "TOGGLE_AI_MODE" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Initial state
export const initialConversationState: ConversationState = {
  currentMessageIndex: 0,
  userInput: "",
  aiResponses: [],
  isAiEnabled: false,
  isLoading: false,
  error: null,
};

// Reducer function
export function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  switch (action.type) {
    case "NEXT_MESSAGE":
      return {
        ...state,
        currentMessageIndex: state.currentMessageIndex + 1,
      };

    case "PREVIOUS_MESSAGE":
      return {
        ...state,
        currentMessageIndex: Math.max(0, state.currentMessageIndex - 1),
      };

    case "SET_MESSAGE_INDEX":
      return {
        ...state,
        currentMessageIndex: action.payload,
      };

    case "SET_USER_INPUT":
      return {
        ...state,
        userInput: action.payload,
      };

    case "ADD_AI_RESPONSE":
      return {
        ...state,
        aiResponses: [...state.aiResponses, action.payload],
        userInput: "", // Clear input after adding response
        currentMessageIndex: state.aiResponses.length, // Point to the new response
        isLoading: false, // Turn off loading state
        error: null, // Clear any previous errors
      };

    case "TOGGLE_AI_MODE":
      // Initialize with a greeting when first switching to AI mode if no responses exist
      const initialResponses =
        state.isAiEnabled || state.aiResponses.length > 0
          ? state.aiResponses
          : [
              "Hello! I'm an AI assistant. How can I help you learn more about Shinyeong?",
            ];

      return {
        ...state,
        isAiEnabled: !state.isAiEnabled,
        aiResponses: initialResponses,
        currentMessageIndex: 0, // Reset to first message when toggling modes
        error: null, // Clear any errors when switching modes
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false, // Turn off loading when error occurs
      };

    default:
      return state;
  }
}
