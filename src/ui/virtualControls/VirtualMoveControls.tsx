import React from "react";
import VirtualControlButton from "./VirtualControlButton";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_GROUP_POSITION,
  CORNER_MARGIN,
  VIRTUAL_CONTROLS_GROUP_WIDTH,
  VIRTUAL_CONTROLS_GROUP_HEIGHT,
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
        left: CORNER_MARGIN,
        bottom: CORNER_MARGIN,
        width: VIRTUAL_CONTROLS_GROUP_WIDTH,
        height: VIRTUAL_CONTROLS_GROUP_HEIGHT,
      }}
    >
      <VirtualControlButton
        label="🚶"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.center}
        onTouchStart={() => void 0}
        onTouchEnd={() => void 0}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.center}
      />
      {/* Up (W) Button */}
      <VirtualControlButton
        label="W"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.up}
        onTouchStart={() => onMoveStart("w")}
        onTouchEnd={() => onMoveEnd("w")}
      />

      {/* Left (A) Button */}
      <VirtualControlButton
        label="A"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.left}
        onTouchStart={() => onMoveStart("a")}
        onTouchEnd={() => onMoveEnd("a")}
      />

      {/* Down (S) Button */}
      <VirtualControlButton
        label="S"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.down}
        onTouchStart={() => onMoveStart("s")}
        onTouchEnd={() => onMoveEnd("s")}
      />

      {/* Right (D) Button */}
      <VirtualControlButton
        label="D"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.right}
        onTouchStart={() => onMoveStart("d")}
        onTouchEnd={() => onMoveEnd("d")}
      />
    </div>
  );
};

export default VirtualMoveControls;
