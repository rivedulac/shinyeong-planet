import React, { useState } from "react";
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
        top: "80px",
        right: "20px",
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
        size="small"
      />

      {/* Left (A) Button */}
      <VirtualControlButton
        label="A"
        position={{ top: "50px", left: "20px" }}
        onTouchStart={() => onMoveStart("a")}
        onTouchEnd={() => onMoveEnd("a")}
        size="small"
      />

      {/* Down (S) Button */}
      <VirtualControlButton
        label="S"
        position={{ top: "100px", left: "70px" }}
        onTouchStart={() => onMoveStart("s")}
        onTouchEnd={() => onMoveEnd("s")}
        size="small"
      />

      {/* Right (D) Button */}
      <VirtualControlButton
        label="D"
        position={{ top: "50px", left: "120px" }}
        onTouchStart={() => onMoveStart("d")}
        onTouchEnd={() => onMoveEnd("d")}
        size="small"
      />
    </div>
  );
};

export default VirtualMoveControls;
