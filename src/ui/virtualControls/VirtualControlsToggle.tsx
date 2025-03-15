import { CORNER_MARGIN, MEDIUM_FONT_SIZE } from "@/config/constants";
import React from "react";

interface VirtualControlsToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const VirtualControlsToggle: React.FC<VirtualControlsToggleProps> = ({
  isEnabled,
  onToggle,
}) => {
  return (
    <button
      onClick={() => onToggle()}
      onTouchEnd={(e) => {
        e.preventDefault(); // Prevent default to avoid double triggering
        onToggle();
      }}
      style={{
        position: "absolute",
        bottom: CORNER_MARGIN,
        left: "46.7%",
        width: "3.5rem",
        backgroundColor: isEnabled
          ? "rgba(83, 52, 131, 0.8)"
          : "rgba(40, 40, 60, 0.8)",
        color: "white",
        justifyContent: "center",
        border: "1px solid rgba(233, 69, 96, 0.8)",
        borderRadius: "6px",
        fontFamily: "monospace",
        fontSize: MEDIUM_FONT_SIZE,
        display: "flex",
        touchAction: "manipulation", // Improves touch response
      }}
    >
      ⌨️
    </button>
  );
};

export default VirtualControlsToggle;
