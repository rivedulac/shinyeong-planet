import React from "react";
import VirtualControlButton from "./VirtualControlButton";

interface VirtualRotationControlsProps {
  onRotateStart: (key: string) => void;
  onRotateEnd: (key: string) => void;
}

/**
 * Virtual controls for rotation (arrow keys)
 * Provides directional control buttons for looking around
 */
const VirtualRotationControls: React.FC<VirtualRotationControlsProps> = ({
  onRotateStart,
  onRotateEnd,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "290px", // Position below the move controls, which are at top: 80px
        right: "20px",
        width: "200px",
        height: "200px",
        zIndex: 1000,
      }}
    >
      {/* Up Arrow Button */}
      <VirtualControlButton
        label="↑"
        position={{ top: "0", left: "70px" }}
        onTouchStart={() => onRotateStart("ArrowUp")}
        onTouchEnd={() => onRotateEnd("ArrowUp")}
        size="small"
        color="rgba(60, 60, 80, 0.6)" // Slightly different color to distinguish from movement controls
      />

      {/* Left Arrow Button */}
      <VirtualControlButton
        label="←"
        position={{ top: "50px", left: "20px" }}
        onTouchStart={() => onRotateStart("ArrowLeft")}
        onTouchEnd={() => onRotateEnd("ArrowLeft")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />

      {/* Down Arrow Button */}
      <VirtualControlButton
        label="↓"
        position={{ top: "100px", left: "70px" }}
        onTouchStart={() => onRotateStart("ArrowDown")}
        onTouchEnd={() => onRotateEnd("ArrowDown")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />

      {/* Right Arrow Button */}
      <VirtualControlButton
        label="→"
        position={{ top: "50px", left: "120px" }}
        onTouchStart={() => onRotateStart("ArrowRight")}
        onTouchEnd={() => onRotateEnd("ArrowRight")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />
    </div>
  );
};

export default VirtualRotationControls;
