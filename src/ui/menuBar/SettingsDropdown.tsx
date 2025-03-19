import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DISPLAY_BACKGROUND_COLOR } from "@/config/constants";

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEditName?: () => void;
  onToggleMinimap?: () => void;
  onChangeLanguage?: (lang: string) => void;
  currentLanguage?: string;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  isOpen,
  onClose,
  onEditName,
  onToggleMinimap,
  onChangeLanguage,
  currentLanguage = "en",
}) => {
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle menu item clicks
  const handleEditNameClick = () => {
    if (onEditName) onEditName();
    onClose();
  };

  const handleMinimapToggle = () => {
    if (onToggleMinimap) onToggleMinimap();
    onClose();
  };

  const handleLanguageChange = (lang: string) => {
    if (onChangeLanguage) onChangeLanguage(lang);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: "45px",
        left: "0",
        width: "200px",
        backgroundColor: DISPLAY_BACKGROUND_COLOR,
        borderRadius: "4px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        zIndex: 1001,
        overflow: "hidden",
      }}
    >
      {/* Edit name option */}
      {onEditName && (
        <div
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "background-color 0.2s ease",
          }}
          onClick={handleEditNameClick}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <span style={{ fontSize: "14px" }}>👤</span>
          <span>{t("playerName.edit")}</span>
        </div>
      )}

      {/* Language selector section */}
      {onChangeLanguage && (
        <div
          style={{
            padding: "10px 15px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ marginBottom: "8px", fontSize: "14px", opacity: 0.8 }}>
            {t("language.title")}
          </div>

          {/* Language options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {[
              { code: "en", name: "English" },
              { code: "ko", name: "한국어" },
              { code: "fr", name: "Français" },
              { code: "zh-CN", name: "简体中文" },
              { code: "zh-TW", name: "繁體中文" },
              { code: "de", name: "Deutsch" },
              { code: "ja", name: "日本語" },
            ].map((lang) => (
              <div
                key={lang.code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 0",
                  cursor: "pointer",
                  fontSize: "14px",
                  opacity: currentLanguage === lang.code ? 1 : 0.7,
                  transition: "opacity 0.2s ease",
                }}
                onClick={() => handleLanguageChange(lang.code)}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity =
                    currentLanguage === lang.code ? "1" : "0.7")
                }
              >
                {currentLanguage === lang.code && <span>✓</span>}
                <span
                  style={{
                    marginLeft: currentLanguage === lang.code ? "0" : "12px",
                  }}
                >
                  {t(`language.${lang.code}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle minimap option */}
      {onToggleMinimap && (
        <div
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.2s ease",
          }}
          onClick={handleMinimapToggle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <span style={{ fontSize: "14px" }}>🗺️</span>
          <span>{t("toggle.minimap", "Toggle Minimap")}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
