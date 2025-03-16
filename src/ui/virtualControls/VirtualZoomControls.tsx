import React from "react";
import VirtualControlButton from "./VirtualControlButton";
import {
  VIRTUAL_CONTROL_BUTTON_COLOR,
  VIRTUAL_CONTROLS_GROUP_WIDTH,
  CORNER_MARGIN,
  VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_CENTER,
  VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_RIGHT,
  VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_LEFT,
} from "@/config/constants";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

interface VirtualZoomControlsProps {
  onZoomStart: (key: string) => void;
  onZoomEnd: (key: string) => void;
}

const VirtualZoomControls: React.FC<VirtualZoomControlsProps> = ({
  onZoomStart,
  onZoomEnd,
}) => {
  // Use our responsive hook to apply scaling
  useResponsiveControls();
  return (
    <div
      style={{
        position: "absolute",
        left: CORNER_MARGIN,
        bottom: `calc(${CORNER_MARGIN} + 18rem)`, // Position above move controls with sufficient spacing
        width: VIRTUAL_CONTROLS_GROUP_WIDTH,
        maxWidth: "40vw", // Limit maximum width on larger screens
        transform: "scale(var(--control-scale, 1))", // Allow scaling on smaller screens
        transformOrigin: "bottom left", // Scale from bottom left
      }}
    >
      <VirtualControlButton
        label="🔍"
        position={{
          left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_CENTER,
        }}
        onTouchStart={() => void 0}
        onTouchEnd={() => void 0}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.center}
      />
      {/* Zoom In Button */}
      <VirtualControlButton
        label="+"
        position={{
          left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_LEFT,
        }}
        onTouchStart={() => onZoomStart("+")}
        onTouchEnd={() => onZoomEnd("+")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />

      {/* Zoom Out Button */}
      <VirtualControlButton
        label="-"
        position={{
          left: VIRTUAL_CONTROLS_BUTTON_HORIZONTAL_RIGHT,
        }}
        onTouchStart={() => onZoomStart("-")}
        onTouchEnd={() => onZoomEnd("-")}
        color={VIRTUAL_CONTROL_BUTTON_COLOR.default}
      />
    </div>
  );
};

export default VirtualZoomControls;
