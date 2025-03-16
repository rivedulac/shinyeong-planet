import React, { useState } from "react";
import { IConversation } from "../game/npcs/interfaces/IConversation";
import { CORNER_MARGIN } from "@/config/constants";

interface ConversationModalProps {
  conversation: IConversation;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Conversation Modal component that displays NPC dialogues
 */
const ConversationModal: React.FC<ConversationModalProps> = ({
  conversation,
  onClose,
  isOpen,
}) => {
  // State to track which message we're currently showing
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Current message to display
  const currentMessage = conversation.messages[currentMessageIndex];

  return (
    <div
      style={{
        position: "absolute",
        top: CORNER_MARGIN,
        right: CORNER_MARGIN,
        width: "calc(min(60%, 350px))",
        backgroundColor: "rgba(30, 30, 50, 0.9)",
        borderRadius: "10px",
        padding: "15px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
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

      {/* Message content */}
      <div
        style={{
          fontSize: "16px",
          lineHeight: "1.4",
          marginBottom: "15px",
          minHeight: "60px",
        }}
      >
        {currentMessage}
      </div>

      {/* Message indicator dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          marginTop: "auto",
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

      {/* Optional manual navigation buttons */}
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
      </div>
    </div>
  );
};

export default ConversationModal;
