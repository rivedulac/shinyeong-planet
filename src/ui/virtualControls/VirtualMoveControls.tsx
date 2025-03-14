import React from "react";
import VirtualControlButton from "./VirtualControlButton";

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
        bottom: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "200px",
        height: "200px",
        zIndex: 1000,
        // No background, making it invisible except for the buttons
      }}
    >
      {/* Up (W) Button */}
      <VirtualControlButton
        label="W"
        position={{ top: "0", left: "70px" }}
        onTouchStart={() => onMoveStart("w")}
        onTouchEnd={() => onMoveEnd("w")}
      />

      {/* Left (A) Button */}
      <VirtualControlButton
        label="A"
        position={{ top: "70px", left: "0" }}
        onTouchStart={() => onMoveStart("a")}
        onTouchEnd={() => onMoveEnd("a")}
      />

      {/* Down (S) Button */}
      <VirtualControlButton
        label="S"
        position={{ top: "140px", left: "70px" }}
        onTouchStart={() => onMoveStart("s")}
        onTouchEnd={() => onMoveEnd("s")}
      />

      {/* Right (D) Button */}
      <VirtualControlButton
        label="D"
        position={{ top: "70px", left: "140px" }}
        onTouchStart={() => onMoveStart("d")}
        onTouchEnd={() => onMoveEnd("d")}
      />
    </div>
  );
};

export default VirtualMoveControls;
