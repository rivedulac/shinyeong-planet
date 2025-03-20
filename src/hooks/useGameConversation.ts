import { useCallback, useReducer } from "react";
import { IConversation } from "../game/npcs/interfaces/IConversation";

interface ConversationState {
  currentConversation: IConversation | null;
  isConversationOpen: boolean;
}

type ConversationAction =
  | { type: "START_CONVERSATION"; payload: IConversation }
  | { type: "END_CONVERSATION" }
  | { type: "CLEAR_CONVERSATION" };

const initialState: ConversationState = {
  currentConversation: null,
  isConversationOpen: false,
};

function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  switch (action.type) {
    case "START_CONVERSATION":
      return {
        ...state,
        currentConversation: action.payload,
        isConversationOpen: true,
      };
    case "END_CONVERSATION":
      return {
        ...state,
        isConversationOpen: false,
      };
    case "CLEAR_CONVERSATION":
      return {
        ...state,
        currentConversation: null,
      };
    default:
      return state;
  }
}

/**
 * Custom hook to manage conversation state in the game
 */
export function useGameConversation() {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  const startConversation = useCallback((conversation: IConversation) => {
    dispatch({ type: "START_CONVERSATION", payload: conversation });
  }, []);

  const endConversation = useCallback(() => {
    dispatch({ type: "END_CONVERSATION" });

    // Keep the conversation data for a moment before clearing it
    // This prevents UI flicker during the closing animation
    setTimeout(() => {
      dispatch({ type: "CLEAR_CONVERSATION" });
    }, 300);
  }, []);

  return {
    currentConversation: state.currentConversation,
    isConversationOpen: state.isConversationOpen,
    startConversation,
    endConversation,
  };
}
