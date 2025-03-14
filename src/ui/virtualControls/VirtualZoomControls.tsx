import React from "react";
import VirtualControlButton from "./VirtualControlButton";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_GROUP_HEIGHT,
  VIRTUAL_CONTROLS_GROUP_POSITION,
  VIRTUAL_CONTROLS_GROUP_WIDTH,
  VIRTUAL_CONTROLS_MARGIN,
} from "@/config/constants";

interface VirtualZoomControlsProps {
  onZoomStart: (key: string) => void;
  onZoomEnd: (key: string) => void;
}

const VirtualZoomControls: React.FC<VirtualZoomControlsProps> = ({
  onZoomStart,
  onZoomEnd,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: VIRTUAL_CONTROLS_MARGIN,
        left: "46%",
        width: VIRTUAL_CONTROLS_GROUP_WIDTH,
        height: VIRTUAL_CONTROLS_GROUP_HEIGHT,
        zIndex: 1000,
      }}
    >
      <VirtualControlButton
        label="🔍"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.center}
        onTouchStart={() => void 0}
        onTouchEnd={() => void 0}
        size="small"
        color={VIRTUAL_CONTROL_BUTTON_COLOR.center}
      />
      {/* Zoom In Button */}
      <VirtualControlButton
        label="+"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.left}
        onTouchStart={() => onZoomStart("+")}
        onTouchEnd={() => onZoomEnd("+")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />

      {/* Zoom Out Button */}
      <VirtualControlButton
        label="-"
        position={VIRTUAL_CONTROLS_GROUP_POSITION.right}
        onTouchStart={() => onZoomStart("-")}
        onTouchEnd={() => onZoomEnd("-")}
        size="small"
        color="rgba(60, 60, 80, 0.6)"
      />
    </div>
  );
};

export default VirtualZoomControls;
