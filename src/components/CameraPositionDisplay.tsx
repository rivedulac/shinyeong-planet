import React from "react";

interface CameraPositionDisplayProps {
  perspective: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      yaw: number;
      pitch: number;
      roll: number;
    };
  };
}

const CameraPositionDisplay: React.FC<CameraPositionDisplayProps> = ({
  perspective,
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
      <div>X: {perspective.position.x.toFixed(2)}</div>
      <div>Y: {perspective.position.y.toFixed(2)}</div>
      <div>Z: {perspective.position.z.toFixed(2)}</div>
      <div>Yaw: {perspective.rotation.yaw.toFixed(2)}</div>
      <div>Pitch: {perspective.rotation.pitch.toFixed(2)}</div>
      <div>Roll: {perspective.rotation.roll.toFixed(2)}</div>
    </div>
  );
};

export default CameraPositionDisplay;
