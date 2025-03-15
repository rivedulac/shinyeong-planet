import React from "react";
import VirtualControlButton from "./VirtualControlButton";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_GROUP_HEIGHT,
  VIRTUAL_CONTROLS_GROUP_POSITION,
  VIRTUAL_CONTROLS_GROUP_WIDTH,
  CORNER_MARGIN,
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
        right: CORNER_MARGIN,
        bottom: CORNER_MARGIN,
        width: VIRTUAL_CONTROLS_GROUP_WIDTH,
        height: VIRTUAL_CONTROLS_GROUP_HEIGHT,
      }}
    >
      <VirtualControlButton
        label="🔄"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.center}
        onTouchStart={() => void 0}
        onTouchEnd={() => void 0}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.center}
      />
      {/* Up Arrow Button */}
      <VirtualControlButton
        label="↑"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.up}
        onTouchStart={() => onRotateStart("ArrowUp")}
        onTouchEnd={() => onRotateEnd("ArrowUp")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />

      {/* Left Arrow Button */}
      <VirtualControlButton
        label="←"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.left}
        onTouchStart={() => onRotateStart("ArrowLeft")}
        onTouchEnd={() => onRotateEnd("ArrowLeft")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />

      {/* Down Arrow Button */}
      <VirtualControlButton
        label="↓"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.down}
        onTouchStart={() => onRotateStart("ArrowDown")}
        onTouchEnd={() => onRotateEnd("ArrowDown")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />

      {/* Right Arrow Button */}
      <VirtualControlButton
        label="→"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.right}
        onTouchStart={() => onRotateStart("ArrowRight")}
        onTouchEnd={() => onRotateEnd("ArrowRight")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />
    </div>
  );
};

export default VirtualRotationControls;
