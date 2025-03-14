import React from "react";
import VirtualControlButton from "./VirtualControlButton";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_GROUP_HEIGHT,
  VIRTUAL_CONTROLS_GROUP_POSITION,
  VIRTUAL_CONTROLS_GROUP_WIDTH,
  VIRTUAL_CONTROLS_MARGIN,
} from "@/config/constants";
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
        top: "240px", // Position below the move controls, which are at top: 80px
        right: VIRTUAL_CONTROLS_MARGIN,
        width: VIRTUAL_CONTROLS_GROUP_WIDTH,
        height: VIRTUAL_CONTROLS_GROUP_HEIGHT,
        zIndex: 1000,
      }}
    >
      <VirtualControlButton
        label="🔄"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.center}
        onTouchStart={() => void 0}
        onTouchEnd={() => void 0}
        size="small"
        color={VIRTUAL_CONTROL_BUTTON_COLOR.center}
      />
      {/* Up Arrow Button */}
      <VirtualControlButton
        label="↑"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.up}
        onTouchStart={() => onRotateStart("ArrowUp")}
        onTouchEnd={() => onRotateEnd("ArrowUp")}
        size="small"
        color="rgba(60, 60, 80, 0.6)" // Slightly different color to distinguish from movement controls
      />

      {/* Left Arrow Button */}
      <VirtualControlButton
        label="←"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.left}
        onTouchStart={() => onRotateStart("ArrowLeft")}
        onTouchEnd={() => onRotateEnd("ArrowLeft")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />

      {/* Down Arrow Button */}
      <VirtualControlButton
        label="↓"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.down}
        onTouchStart={() => onRotateStart("ArrowDown")}
        onTouchEnd={() => onRotateEnd("ArrowDown")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />

      {/* Right Arrow Button */}
      <VirtualControlButton
        label="→"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.right}
        onTouchStart={() => onRotateStart("ArrowRight")}
        onTouchEnd={() => onRotateEnd("ArrowRight")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />
    </div>
  );
};

export default VirtualRotationControls;
