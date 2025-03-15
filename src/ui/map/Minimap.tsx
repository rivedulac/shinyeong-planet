import React from "react";

interface MinimapProps {
  // Will be expanded later with player position, NPCs, etc.
}

/**
 * A minimap component that displays a top-down view of the game world
 */
const Minimap: React.FC<MinimapProps> = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(255, 255, 255, 0.5)",
        backgroundColor: "rgba(0, 0, 15, 0.7)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        style={{ display: "block" }}
      >
        {/* Simple placeholder circle */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="rgba(26, 26, 46, 0.9)"
          stroke="#ffffff"
          strokeWidth="1"
        />
        {/* Player position marker (center) */}
        <polygon points="100,94 96,106 104,106" fill="#ff3333" />
        <text x="100" y="120" textAnchor="middle" fill="white" fontSize="12">
          Minimap
        </text>
      </svg>
    </div>
  );
};

export default Minimap;
