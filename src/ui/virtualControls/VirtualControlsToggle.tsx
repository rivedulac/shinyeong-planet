import {
  CORNER_MARGIN,
  MEDIUM_FONT_SIZE,
  TOGGLE_BUTTON_SIZE,
} from "@/config/constants";
import React from "react";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

interface VirtualControlsToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const VirtualControlsToggle: React.FC<VirtualControlsToggleProps> = ({
  isEnabled,
  onToggle,
}) => {
  // Use our responsive hook to apply scaling
  useResponsiveControls();
  return (
    <button
      onClick={() => onToggle()}
      onTouchEnd={(e) => {
        e.preventDefault(); // Prevent default to avoid double triggering
        onToggle();
      }}
      style={{
        position: "absolute",
        bottom: CORNER_MARGIN, // Keep at bottom
        left: CORNER_MARGIN, // Change from middle to left corner
        width: TOGGLE_BUTTON_SIZE, // Responsive width
        height: TOGGLE_BUTTON_SIZE, // Responsive height
        backgroundColor: isEnabled
          ? "rgba(83, 52, 131, 0.8)"
          : "rgba(40, 40, 60, 0.8)",
        color: "white",
        border: "1px solid rgba(233, 69, 96, 0.8)",
        borderRadius: "50%",
        fontFamily: "monospace",
        fontSize: MEDIUM_FONT_SIZE,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        touchAction: "manipulation", // Improves touch response
      }}
    >
      ⌨️
    </button>
  );
};

export default VirtualControlsToggle;
