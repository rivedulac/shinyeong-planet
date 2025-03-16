import {
  CORNER_MARGIN,
  DISPLAY_BACKGROUND_COLOR,
  FONT_COLOR,
  TINY_FONT_SIZE,
} from "@/config/constants";
import React from "react";
import { useTranslation } from "react-i18next";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

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
  useResponsiveControls();

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(" + CORNER_MARGIN + " + 12rem)", // Position below ControlsInfoDisplay with sufficient space
        left: CORNER_MARGIN,
        padding: "10px",
        backgroundColor: DISPLAY_BACKGROUND_COLOR,
        color: FONT_COLOR,
        fontFamily: "monospace",
        fontSize: TINY_FONT_SIZE,
        borderRadius: "4px",
        transform: "scale(var(--control-scale, 1))",
        transformOrigin: "top left",
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
