import {
  CORNER_MARGIN,
  MEDIUM_FONT_SIZE,
  TOGGLE_BUTTON_SIZE,
} from "@/config/constants";
import React from "react";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

interface InfoToggleProps {
  onToggle: () => void;
  active: boolean;
}

const InfoToggle: React.FC<InfoToggleProps> = ({ onToggle, active }) => {
  useResponsiveControls();

  return (
    <button
      onClick={onToggle}
      style={{
        position: "absolute",
        top: "calc(" + CORNER_MARGIN + " + 3.5rem)", // Position below SettingsToggle
        right: CORNER_MARGIN,
        width: TOGGLE_BUTTON_SIZE,
        height: TOGGLE_BUTTON_SIZE,
        backgroundColor: active
          ? "rgba(83, 52, 131, 0.8)"
          : "rgba(40, 40, 60, 0.8)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        fontSize: MEDIUM_FONT_SIZE,
        cursor: "pointer",
        zIndex: 1001,
        transform: "scale(var(--control-scale, 1))",
        transformOrigin: "top right",
      }}
    >
      ℹ️
    </button>
  );
};

export default InfoToggle;
