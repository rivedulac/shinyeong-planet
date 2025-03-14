import React from "react";
import VirtualControlButton from "./VirtualControlButton";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_GROUP_HEIGHT,
  VIRTUAL_CONTROLS_GROUP_POSITION,
  VIRTUAL_CONTROLS_GROUP_WIDTH,
  VIRTUAL_CONTROLS_MARGIN,
} from "@/config/constants";
interface VirtualMoveControlsProps {
  onMoveStart: (key: string) => void;
  onMoveEnd: (key: string) => void;
}

// Main component that renders all the virtual controls
const VirtualMoveControls: React.FC<VirtualMoveControlsProps> = ({
  onMoveStart,
  onMoveEnd,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "80px",
        right: VIRTUAL_CONTROLS_MARGIN,
        width: VIRTUAL_CONTROLS_GROUP_WIDTH,
        height: VIRTUAL_CONTROLS_GROUP_HEIGHT,
        zIndex: 1000,
        // No background, making it invisible except for the buttons
      }}
    >
      <VirtualControlButton
        label="🚶"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.center}
        onTouchStart={() => void 0}
        onTouchEnd={() => void 0}
        size="small"
        color={VIRTUAL_CONTROL_BUTTON_COLOR.center}
      />
      {/* Up (W) Button */}
      <VirtualControlButton
        label="W"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.up}
        onTouchStart={() => onMoveStart("w")}
        onTouchEnd={() => onMoveEnd("w")}
        size="small"
      />

      {/* Left (A) Button */}
      <VirtualControlButton
        label="A"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.left}
        onTouchStart={() => onMoveStart("a")}
        onTouchEnd={() => onMoveEnd("a")}
        size="small"
      />

      {/* Down (S) Button */}
      <VirtualControlButton
        label="S"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.down}
        onTouchStart={() => onMoveStart("s")}
        onTouchEnd={() => onMoveEnd("s")}
        size="small"
      />

      {/* Right (D) Button */}
      <VirtualControlButton
        label="D"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.right}
        onTouchStart={() => onMoveStart("d")}
        onTouchEnd={() => onMoveEnd("d")}
        size="small"
      />
    </div>
  );
};

export default VirtualMoveControls;
