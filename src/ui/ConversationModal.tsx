import React, { useState } from "react";
import { IConversation } from "../game/npcs/interfaces/IConversation";
import { CORNER_MARGIN } from "@/config/constants";
import geminiService from "../services/GeminiService";

interface ConversationModalProps {
  conversation: IConversation;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Conversation Modal component that displays NPC dialogues
 * Now with AI-powered dynamic responses
 */
const ConversationModal: React.FC<ConversationModalProps> = ({
  conversation,
  onClose,
  isOpen,
}) => {
  // State to track which message we're currently showing
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // State for user input and AI responses
  const [userInput, setUserInput] = useState("");
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Current message to display
  const currentMessage = isAiEnabled
    ? aiResponses[currentMessageIndex] || "I'm listening..."
    : conversation.messages[currentMessageIndex];

  // Handle user input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Send message to AI service
      const response = await geminiService.sendMessage(userInput);

      // Add response to the list
      setAiResponses([...aiResponses, response]);

      // Clear input field
      setUserInput("");

      // Move to the new response
      setCurrentMessageIndex(aiResponses.length);
    } catch (err) {
      setError("Failed to get AI response. Please try again.");
      console.error("Error getting AI response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between scripted and AI conversation modes
  const toggleAiMode = () => {
    if (!isAiEnabled && aiResponses.length === 0) {
      // Initialize with a greeting when first switching to AI mode
      setAiResponses([
        "Hello! I'm an AI assistant. How can I help you learn more about Shinyeong?",
      ]);
    }
    setIsAiEnabled(!isAiEnabled);
    setCurrentMessageIndex(0);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: CORNER_MARGIN,
        right: CORNER_MARGIN,
        width: "calc(min(80%, 450px))",
        backgroundColor: "rgba(30, 30, 50, 0.9)",
        borderRadius: "10px",
        padding: "15px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        maxHeight: "80vh",
      }}
    >
      {/* Header with title and close button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          paddingBottom: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {conversation.icon && (
            <span style={{ fontSize: "24px" }}>{conversation.icon}</span>
          )}
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "normal",
            }}
          >
            {conversation.title}
          </h3>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={toggleAiMode}
            style={{
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "4px",
              color: "white",
              padding: "3px 6px",
              fontSize: "14px",
              cursor: "pointer",
              opacity: 0.8,
            }}
            aria-label="Toggle AI chat mode"
          >
            {isAiEnabled ? "Scripted Mode" : "AI Chat"}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              padding: "0 5px",
              opacity: 0.7,
            }}
            aria-label="Close conversation"
          >
            ×
          </button>
        </div>
      </div>

      {/* Message content */}
      <div
        style={{
          fontSize: "16px",
          lineHeight: "1.4",
          marginBottom: "15px",
          minHeight: "60px",
          maxHeight: "300px",
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          borderRadius: "5px",
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ marginBottom: "10px" }}>Thinking...</div>
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <div
            style={{ color: "#ff6b6b", padding: "10px", textAlign: "center" }}
          >
            {error}
          </div>
        ) : (
          currentMessage
        )}
      </div>

      {/* AI chat input */}
      {isAiEnabled && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "10px",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me anything..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            style={{
              padding: "8px 12px",
              backgroundColor: "rgba(64, 128, 255, 0.6)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: isLoading || !userInput.trim() ? "default" : "pointer",
              opacity: isLoading || !userInput.trim() ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </form>
      )}

      {/* Message indicator dots - only for scripted mode */}
      {!isAiEnabled && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "auto",
            padding: "10px 0",
          }}
        >
          {conversation.messages.map((_, index) => (
            <div
              key={index}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  index === currentMessageIndex
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <button
          onClick={() =>
            setCurrentMessageIndex(Math.max(0, currentMessageIndex - 1))
          }
          disabled={currentMessageIndex === 0}
          style={{
            padding: "4px 10px",
            background: "none",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            color: "white",
            opacity: currentMessageIndex === 0 ? 0.3 : 0.8,
            cursor: currentMessageIndex === 0 ? "default" : "pointer",
          }}
        >
          Previous
        </button>

        {!isAiEnabled && (
          <button
            onClick={() =>
              setCurrentMessageIndex(
                Math.min(
                  conversation.messages.length - 1,
                  currentMessageIndex + 1
                )
              )
            }
            disabled={currentMessageIndex === conversation.messages.length - 1}
            style={{
              padding: "4px 10px",
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "4px",
              color: "white",
              opacity:
                currentMessageIndex === conversation.messages.length - 1
                  ? 0.3
                  : 0.8,
              cursor:
                currentMessageIndex === conversation.messages.length - 1
                  ? "default"
                  : "pointer",
            }}
          >
            Next
          </button>
        )}

        {isAiEnabled && aiResponses.length > 0 && (
          <button
            onClick={() =>
              setCurrentMessageIndex(
                Math.min(aiResponses.length - 1, currentMessageIndex + 1)
              )
            }
            disabled={currentMessageIndex === aiResponses.length - 1}
            style={{
              padding: "4px 10px",
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "4px",
              color: "white",
              opacity:
                currentMessageIndex === aiResponses.length - 1 ? 0.3 : 0.8,
              cursor:
                currentMessageIndex === aiResponses.length - 1
                  ? "default"
                  : "pointer",
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ConversationModal;
