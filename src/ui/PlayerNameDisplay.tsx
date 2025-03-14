import React from "react";
import { useTranslation } from "react-i18next";

interface PlayerNameDisplayProps {
  name: string;
}

const PlayerNameDisplay: React.FC<PlayerNameDisplayProps> = ({ name }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 15px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "16px",
        borderRadius: "4px",
        zIndex: 1000,
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {t("playerName.display", { name })}
    </div>
  );
};

export default PlayerNameDisplay;
