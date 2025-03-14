import React, { useState } from "react";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_BUTTON_SIZE,
} from "@/config/constants";
export interface VirtualControlButtonProps {
  label: string;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  size?: "small" | "medium" | "large";
  shape?: "circle" | "square";
  color?: string;
  pressedColor?: string;
}

const VirtualControlButton: React.FC<VirtualControlButtonProps> = ({
  label,
  onTouchStart,
  onTouchEnd,
  position,
  size = "medium",
  shape = "circle",
  color = VIRTUAL_CONTROL_BUTTON_COLOR.default,
  pressedColor = VIRTUAL_CONTROL_BUTTON_COLOR.pressed,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const dimensions = VIRTUAL_CONTROLS_BUTTON_SIZE[size];

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default behavior
    setIsPressed(true);
    onTouchStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default behavior
    setIsPressed(false);
    onTouchEnd();
  };

  // Also handle mouse events for testing on desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(true);
    onTouchStart();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(false);
    onTouchEnd();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPressed) {
      setIsPressed(false);
      onTouchEnd();
    }
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "absolute",
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: isPressed ? pressedColor : color,
        color: "white",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        borderRadius: shape === "circle" ? "50%" : "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: dimensions.fontSize,
        fontWeight: "bold",
        cursor: "pointer",
        userSelect: "none",
        touchAction: "manipulation",
        ...position,
        transition: "background-color 0.15s ease",
        boxShadow: isPressed
          ? "0 0 0 rgba(0, 0, 0, 0)"
          : "0 4px 6px rgba(0, 0, 0, 0.3)",
        transform: isPressed ? "translateY(2px)" : "translateY(0)",
      }}
    >
      {label}
    </button>
  );
};

export default VirtualControlButton;
