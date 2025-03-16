import React from "react";
import VirtualControlButton from "./VirtualControlButton";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_GROUP_POSITION,
  CORNER_MARGIN,
  VIRTUAL_CONTROLS_GROUP_WIDTH,
  VIRTUAL_CONTROLS_GROUP_HEIGHT,
  VIRTUAL_CONTROLS_BUTTON_VERTICAL_TOP,
  VIRTUAL_CONTROLS_BUTTON_VERTICAL_BOTTOM,
  VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_LEFT,
  VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_RIGHT,
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
      {/* Up Arrow Button */}
      <VirtualControlButton
        dataTestId="up-arrow-button"
        label="↑"
        position={{
          top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_TOP,
          left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_LEFT,
        }}
        onTouchStart={() => onMoveStart("ArrowUp")}
        onTouchEnd={() => onMoveEnd("ArrowUp")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />
      {/* Up (W) Button */}
      <VirtualControlButton
        label="W"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.up}
        onTouchStart={() => onMoveStart("w")}
        onTouchEnd={() => onMoveEnd("w")}
      />

      {/* Down Arrow Button */}
      <VirtualControlButton
        dataTestId="down-arrow-button"
        label="↓"
        position={{
          top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_TOP,
          left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_RIGHT,
        }}
        onTouchStart={() => onMoveStart("ArrowDown")}
        onTouchEnd={() => onMoveEnd("ArrowDown")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />

      {/* Left (A) Button */}
      <VirtualControlButton
        label="A"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.left}
        onTouchStart={() => onMoveStart("a")}
        onTouchEnd={() => onMoveEnd("a")}
      />
      <VirtualControlButton
        label="🚶"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.center}
        onTouchStart={() => void 0}
        onTouchEnd={() => void 0}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.center}
      />
      {/* Right (D) Button */}
      <VirtualControlButton
        label="D"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.right}
        onTouchStart={() => onMoveStart("d")}
        onTouchEnd={() => onMoveEnd("d")}
      />

      {/* Left Arrow Button */}
      <VirtualControlButton
        dataTestId="left-arrow-button"
        label="←"
        position={{
          top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_BOTTOM,
          left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_LEFT,
        }}
        onTouchStart={() => onMoveStart("ArrowLeft")}
        onTouchEnd={() => onMoveEnd("ArrowLeft")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />
      {/* Down (S) Button */}
      <VirtualControlButton
        label="S"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.down}
        onTouchStart={() => onMoveStart("s")}
        onTouchEnd={() => onMoveEnd("s")}
      />
      {/* Right Arrow Button */}
      <VirtualControlButton
        dataTestId="right-arrow-button"
        label="→"
        position={{
          top: VIRTUAL_CONTROLS_BUTTON_VERTICAL_BOTTOM,
          left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_RIGHT,
        }}
        onTouchStart={() => onMoveStart("ArrowRight")}
        onTouchEnd={() => onMoveEnd("ArrowRight")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />
    </div>
  );
};

export default VirtualMoveControls;
