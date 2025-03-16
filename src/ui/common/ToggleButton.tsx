// src/ui/common/ToggleButton.tsx
import React from "react";
import {
  TOGGLE_BUTTON_SIZE,
  MEDIUM_FONT_SIZE,
  TOGGLE_ACTIVE_COLOR,
  TOGGLE_INACTIVE_COLOR,
  TOGGLE_BORDER_COLOR,
} from "@/config/constants";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

interface ToggleButtonProps {
  // Core functionality
  isActive: boolean;
  onToggle: () => void;
  icon: string; // Emoji or text to display

  // Positioning
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  label?: string; // Accessibility label
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onToggle,
  icon,
  position,
  label,
}) => {
  // Use our responsive hook for scaling
  useResponsiveControls();

  // Calculate transform origin based on position
  const getTransformOrigin = () => {
    const vertical = position.top ? "top" : "bottom";
    const horizontal = position.left ? "left" : "right";
    return `${vertical} ${horizontal}`;
  };

  return (
    <button
      onClick={onToggle}
      aria-label={label}
      style={{
        position: "absolute",
        ...position,
        width: TOGGLE_BUTTON_SIZE,
        height: TOGGLE_BUTTON_SIZE,
        backgroundColor: isActive ? TOGGLE_ACTIVE_COLOR : TOGGLE_INACTIVE_COLOR,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: `1px solid ${TOGGLE_BORDER_COLOR}`,
        borderRadius: "50%",
        fontSize: MEDIUM_FONT_SIZE,
        cursor: "pointer",
        transition: "background-color 0.3s",
        zIndex: 1001,
        transform: "scale(var(--control-scale, 1))",
        transformOrigin: getTransformOrigin(),
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      }}
    >
      {icon}
    </button>
  );
};

export default ToggleButton;
