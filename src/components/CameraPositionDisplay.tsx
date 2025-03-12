import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      <div>{t("cameraPosition.title")}</div>
      <div>
        {t("cameraPosition.x", { value: perspective.position.x.toFixed(2) })}
      </div>
      <div>
        {t("cameraPosition.y", { value: perspective.position.y.toFixed(2) })}
      </div>
      <div>
        {t("cameraPosition.z", { value: perspective.position.z.toFixed(2) })}
      </div>
      <div>
        {t("cameraPosition.yaw", {
          value: perspective.rotation.yaw.toFixed(2),
        })}
      </div>
      <div>
        {t("cameraPosition.pitch", {
          value: perspective.rotation.pitch.toFixed(2),
        })}
      </div>
      <div>
        {t("cameraPosition.roll", {
          value: perspective.rotation.roll.toFixed(2),
        })}
      </div>
    </div>
  );
};

export default CameraPositionDisplay;
