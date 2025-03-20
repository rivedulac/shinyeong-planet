import React, { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";
import {
  DISPLAY_BACKGROUND_COLOR,
  FONT_COLOR,
  SMALL_FONT_SIZE,
} from "@/config/constants";
import SettingsDropdown from "./SettingsDropdown";
import InfoDropdown from "./InfoDropdown";
import { menuBarReducer, initialMenuBarState } from "./MenuBarReducer";

interface MenuBarProps {
  playerName: string;
  onEditName?: () => void;
  onToggleControls?: () => void;
  onToggleCamera?: () => void;
  onChangeLanguage?: (lang: string) => void;
  onToggleMinimap?: () => void;
  currentLanguage?: string;
}

const MenuBar: React.FC<MenuBarProps> = ({
  playerName,
  onEditName,
  onToggleControls,
  onToggleCamera,
  onChangeLanguage,
  onToggleMinimap,
  currentLanguage,
}) => {
  const { t, i18n } = useTranslation();
  useResponsiveControls(); // Apply responsive scaling

  // Use reducer for state management
  const [state, dispatch] = useReducer(menuBarReducer, initialMenuBarState);
  const { settingsHovered, infoHovered, settingsOpen, infoOpen } = state;

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
      {/* Left section - icons with dropdowns */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {/* Settings icon and dropdown */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "50%",
              fontSize: SMALL_FONT_SIZE,
              backgroundColor:
                settingsHovered || settingsOpen
                  ? "rgba(255, 255, 255, 0.2)"
                  : "transparent",
              transition: "background-color 0.2s ease",
            }}
            onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
            onMouseEnter={() =>
              dispatch({ type: "SET_SETTINGS_HOVERED", payload: true })
            }
            onMouseLeave={() =>
              dispatch({ type: "SET_SETTINGS_HOVERED", payload: false })
            }
            title={t("settings.title", "Settings")}
          >
            ⚙️
          </div>

          <SettingsDropdown
            isOpen={settingsOpen}
            onClose={() => dispatch({ type: "CLOSE_ALL_DROPDOWNS" })}
            onEditName={onEditName}
            onToggleMinimap={onToggleMinimap}
            onChangeLanguage={onChangeLanguage}
            currentLanguage={currentLanguage || i18n.language}
          />
        </div>

        {/* Information icon and dropdown */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "50%",
              fontSize: SMALL_FONT_SIZE,
              backgroundColor:
                infoHovered || infoOpen
                  ? "rgba(255, 255, 255, 0.2)"
                  : "transparent",
              transition: "background-color 0.2s ease",
            }}
            onClick={() => dispatch({ type: "TOGGLE_INFO" })}
            onMouseEnter={() =>
              dispatch({ type: "SET_INFO_HOVERED", payload: true })
            }
            onMouseLeave={() =>
              dispatch({ type: "SET_INFO_HOVERED", payload: false })
            }
            title={t("info.title", "Information")}
          >
            ℹ️
          </div>

          <InfoDropdown
            isOpen={infoOpen}
            onClose={() => dispatch({ type: "CLOSE_ALL_DROPDOWNS" })}
            onToggleControls={onToggleControls}
            onToggleCamera={onToggleCamera}
          />
        </div>
      </div>

      {/* Right section - player name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: onEditName ? "pointer" : "default",
          fontSize: SMALL_FONT_SIZE,
        }}
        onClick={onEditName}
        title={onEditName ? t("playerName.edit", "Edit Name") : ""}
      >
        {playerName ? (
          <div>{t("playerName.display", { name: playerName })}</div>
        ) : null}
      </div>
    </div>
  );
};

export default MenuBar;
