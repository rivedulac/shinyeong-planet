import {
  CORNER_MARGIN,
  SMALL_FONT_SIZE,
  TOGGLE_BUTTON_SIZE,
} from "@/config/constants";
import React from "react";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

interface MinimapToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

/**
 * A toggle button for showing/hiding the minimap
 */
const MinimapToggle: React.FC<MinimapToggleProps> = ({
  isVisible,
  onToggle,
}) => {
  // Use our responsive hook for scaling
  useResponsiveControls();
  return (
    <button
      onClick={onToggle}
      aria-label={isVisible ? "Hide minimap" : "Show minimap"}
      data-testid="minimap-toggle"
      style={{
        position: "absolute",
        bottom: CORNER_MARGIN,
        right: CORNER_MARGIN,
        width: TOGGLE_BUTTON_SIZE,
        height: TOGGLE_BUTTON_SIZE,
        borderRadius: "50%",
        backgroundColor: isVisible
          ? "rgba(83, 52, 131, 0.8)"
          : "rgba(40, 40, 60, 0.8)",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        fontSize: SMALL_FONT_SIZE,
        display: "flex",
        transition: "background-color 0.3s",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 1001,
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      }}
    >
      {isVisible ? "🗺️" : "📍"}
    </button>
  );
};

export default MinimapToggle;
