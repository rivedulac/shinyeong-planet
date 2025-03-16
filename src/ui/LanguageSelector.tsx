import { CORNER_MARGIN } from "@/config/constants";
import React from "react";
import { useTranslation } from "react-i18next";
import { useResponsiveControls } from "@/hooks/useResponsiveControls";

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  useResponsiveControls();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(" + CORNER_MARGIN + " + 3rem)", // Position below NameEditButton
        left: CORNER_MARGIN,
        padding: "8px 10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "0.85rem",
        borderRadius: "4px",
        zIndex: 1000,
        transform: "scale(var(--control-scale, 1))",
        transformOrigin: "top left",
      }}
    >
      <div style={{ marginBottom: "5px", whiteSpace: "nowrap" }}>
        {t("language.title")}
      </div>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          backgroundColor: "rgba(50, 50, 50, 0.8)",
          color: "white",
          border: "1px solid #555",
          borderRadius: "3px",
          padding: "3px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        <option value="en">{t("language.en")}</option>
        <option value="ko">{t("language.ko")}</option>
        <option value="fr">{t("language.fr")}</option>
        <option value="zh-CN">{t("language.zh-CN")}</option>
        <option value="zh-TW">{t("language.zh-TW")}</option>
        <option value="de">{t("language.de")}</option>
        <option value="ja">{t("language.ja")}</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
