import React, { useEffect, useRef, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { DISPLAY_BACKGROUND_COLOR } from "@/config/constants";
import {
  infoDropdownReducer,
  initialInfoDropdownState,
} from "./InfoDropdownReducer";

interface InfoDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleControls?: () => void;
  onToggleCamera?: () => void;
}

const InfoDropdown: React.FC<InfoDropdownProps> = ({
  isOpen,
  onClose,
  onToggleControls,
  onToggleCamera,
}) => {
  const { t } = useTranslation();
  const [_, dispatch] = useReducer(
    infoDropdownReducer,
    initialInfoDropdownState
  );
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
      dispatch({ type: "HIDE_ALL" });
    };
  }, [isOpen, onClose]);

  // Handle menu item clicks
  const handleControlsToggle = () => {
    if (onToggleControls) {
      onToggleControls();
      dispatch({ type: "TOGGLE_CONTROLS" });
    }
    onClose();
  };

  const handleCameraToggle = () => {
    if (onToggleCamera) {
      onToggleCamera();
      dispatch({ type: "TOGGLE_CAMERA" });
    }
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
      {/* Controls info option */}
      {onToggleControls && (
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
          onClick={handleControlsToggle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <span style={{ fontSize: "14px" }}>🎮</span>
          <span>{t("controls.title", "Game Controls")}</span>
        </div>
      )}

      {/* Camera position option */}
      {onToggleCamera && (
        <div
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.2s ease",
          }}
          onClick={handleCameraToggle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <span style={{ fontSize: "14px" }}>📷</span>
          <span>{t("cameraPosition.title", "Camera Position")}</span>
        </div>
      )}
    </div>
  );
};

export default InfoDropdown;
