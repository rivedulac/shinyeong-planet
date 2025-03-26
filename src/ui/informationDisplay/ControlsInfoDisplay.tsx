import {
  CORNER_MARGIN,
  DISPLAY_BACKGROUND_COLOR,
  FONT_COLOR,
  TINY_FONT_SIZE,
} from "@/config/constants";
import React from "react";
import { useTranslation } from "react-i18next";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Use the virtual controls system instead.
 */
const ControlsInfoDisplay: React.FC = () => {
  const { t } = useTranslation();
  useResponsiveControls();

  // Log warning in development
  React.useEffect(() => {
    console.warn(
      "ControlsInfoDisplay is deprecated and will be removed in a future version. Use the virtual controls system instead."
    );
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: CORNER_MARGIN,
        left: CORNER_MARGIN,
        padding: "10px",
        backgroundColor: DISPLAY_BACKGROUND_COLOR,
        color: FONT_COLOR,
        fontFamily: "monospace",
        fontSize: TINY_FONT_SIZE,
        borderRadius: "4px",
        transform: "scale(var(--control-scale, 1))",
        transformOrigin: "top left",
        opacity: 0.5, // Reduce opacity to indicate deprecated status
      }}
    >
      <div style={{ color: "red", marginBottom: "8px" }}>
        ⚠️ {t("controls.deprecated", "This display is deprecated")}
      </div>
      {t("controls.title")}
      <div>{t("controls.moveForward")}</div>
      <div>{t("controls.moveBackward")}</div>
      <div>{t("controls.strafeLeft")}</div>
      <div>{t("controls.strafeRight")}</div>
      <div>{t("controls.rotateLeft")}</div>
      <div>{t("controls.rotateRight")}</div>
      <div>{t("controls.lookUp")}</div>
      <div>{t("controls.lookDown")}</div>
      <div>{t("controls.zoomIn")}</div>
      <div>{t("controls.zoomOut")}</div>
    </div>
  );
};

export default ControlsInfoDisplay;
