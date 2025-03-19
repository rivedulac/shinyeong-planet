import React from "react";
import { useTranslation } from "react-i18next";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";
import { DISPLAY_BACKGROUND_COLOR, FONT_COLOR } from "@/config/constants";

interface MenuBarProps {
  playerName: string;
}

/**
 * Top bar component that displays across the top of the screen
 * Contains settings icon, information icon, and player name
 */
const MenuBar: React.FC<MenuBarProps> = ({ playerName }) => {
  const { t } = useTranslation();
  useResponsiveControls(); // Apply responsive scaling

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "50px",
        backgroundColor: DISPLAY_BACKGROUND_COLOR,
        color: FONT_COLOR,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        zIndex: 1000,
        fontFamily: "monospace",
        transform: "scale(var(--control-scale, 1))",
        transformOrigin: "top center",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Left section - will contain icons */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {/* Settings icon placeholder */}
        <div style={{ width: "24px", height: "24px", cursor: "pointer" }}>
          ⚙️
        </div>

        {/* Information icon placeholder */}
        <div style={{ width: "24px", height: "24px", cursor: "pointer" }}>
          ℹ️
        </div>
      </div>

      {/* Right section - player name */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {playerName ? (
          <div>{t("playerName.display", { name: playerName })}</div>
        ) : null}
      </div>
    </div>
  );
};

export default MenuBar;
