import React from "react";
import { useTranslation } from "react-i18next";
import { CORNER_MARGIN } from "@/config/constants";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

interface NameEditButtonProps {
  onClick: () => void;
}

const NameEditButton: React.FC<NameEditButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  useResponsiveControls();

  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: CORNER_MARGIN,
        left: CORNER_MARGIN,
        padding: "8px 12px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "0.85rem",
        cursor: "pointer",
        zIndex: 1000,
        transform: "scale(var(--control-scale, 1))",
        transformOrigin: "top left",
        whiteSpace: "nowrap",
      }}
    >
      {t("playerName.edit")}
    </button>
  );
};

export default NameEditButton;
