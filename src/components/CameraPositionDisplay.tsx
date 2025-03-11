import React from "react";

interface CameraPositionDisplayProps {
  position: {
    x: number;
    y: number;
    z: number;
  };
}

const CameraPositionDisplay: React.FC<CameraPositionDisplayProps> = ({
  position,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "14px",
        borderRadius: "4px",
        zIndex: 1000,
        userSelect: "none",
      }}
    >
      <div>Camera Position</div>
      <div>X: {position.x.toFixed(2)}</div>
      <div>Y: {position.y.toFixed(2)}</div>
      <div>Z: {position.z.toFixed(2)}</div>
    </div>
  );
};

export default CameraPositionDisplay;
