// src/ui/NameEditButton.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface NameEditButtonProps {
  onClick: () => void;
}

const NameEditButton: React.FC<NameEditButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "5px 10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "12px",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      {t("playerName.edit")}
    </button>
  );
};

export default NameEditButton;
