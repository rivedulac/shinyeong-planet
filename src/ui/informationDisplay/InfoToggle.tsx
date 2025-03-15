import { CORNER_MARGIN, MEDIUM_FONT_SIZE } from "@/config/constants";
import React from "react";

interface InfoToggleProps {
  onToggle: () => void;
  active: boolean;
}

const InfoToggle: React.FC<InfoToggleProps> = ({ onToggle, active }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "absolute",
        top: CORNER_MARGIN,
        right: CORNER_MARGIN,
        backgroundColor: active
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(255, 255, 255, 0.3)",
        border: "none",
        borderRadius: "10px",
        fontSize: MEDIUM_FONT_SIZE,
        display: "flex",
        transition: "background-color 0.3s",
      }}
    >
      ℹ️
    </button>
  );
};

export default InfoToggle;
