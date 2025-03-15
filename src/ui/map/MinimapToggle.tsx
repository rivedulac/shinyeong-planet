import { CORNER_MARGIN } from "@/config/constants";
import React from "react";

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
  return (
    <button
      onClick={onToggle}
      aria-label={isVisible ? "Hide minimap" : "Show minimap"}
      data-testid="minimap-toggle"
      style={{
        position: "absolute",
        bottom: CORNER_MARGIN,
        right: CORNER_MARGIN,
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: isVisible
          ? "rgba(83, 52, 131, 0.8)"
          : "rgba(40, 40, 60, 0.8)",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        zIndex: 1001,
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      }}
    >
      {isVisible ? "🗺️" : "📍"}
    </button>
  );
};

export default MinimapToggle;
