import { VIRTUAL_CONTROLS_MARGIN } from "@/config/constants";
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
        top: VIRTUAL_CONTROLS_MARGIN,
        right: VIRTUAL_CONTROLS_MARGIN,
        padding: "8px 12px",
        width: "230px",
        backgroundColor: isEnabled
          ? "rgba(83, 52, 131, 0.8)"
          : "rgba(40, 40, 60, 0.8)",
        color: "white",
        border: "1px solid rgba(233, 69, 96, 0.8)",
        borderRadius: "6px",
        fontFamily: "monospace",
        fontSize: "14px",
        cursor: "pointer",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        touchAction: "manipulation", // Improves touch response
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "18px",
          height: "18px",
          backgroundColor: isEnabled
            ? "rgba(233, 69, 96, 0.8)"
            : "rgba(100, 100, 100, 0.8)",
          borderRadius: "50%",
          transition: "background-color 0.3s ease",
        }}
      />
      {isEnabled ? "Virtual Controls: ON" : "Virtual Controls: OFF"}
    </button>
  );
};

export default VirtualControlsToggle;
