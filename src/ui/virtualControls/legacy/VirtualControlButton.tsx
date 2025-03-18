import React, { useState } from "react";
import {
  FONT_COLOR,
  SMALL_FONT_SIZE,
  VIRTUAL_CONTROL_BUTTON_COLOR,
} from "@/config/constants";
export interface VirtualControlButtonProps {
  label?: string;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  color?: string;
  pressedColor?: string;
  image?: string;
  imageSize?: string;
  dataTestId?: string;
}

const VirtualControlButton: React.FC<VirtualControlButtonProps> = ({
  label,
  onTouchStart,
  onTouchEnd,
  position,
  color = VIRTUAL_CONTROL_BUTTON_COLOR.default,
  pressedColor = VIRTUAL_CONTROL_BUTTON_COLOR.pressed,
  image,
  imageSize,
  dataTestId,
}) => {
  const [isPressed, setIsPressed] = useState(false);

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
      data-testid={dataTestId}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "absolute",
        width: "2.5rem",
        height: "2.5rem",
        backgroundColor: isPressed ? pressedColor : color,
        color: FONT_COLOR,
        border: "2px solid rgba(255, 255, 255, 1.0)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: SMALL_FONT_SIZE,
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
      {image ? (
        <img
          src={image}
          alt={label}
          style={{
            width: imageSize,
            height: imageSize,
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
          }}
        />
      ) : (
        label
      )}
    </button>
  );
};

export default VirtualControlButton;
