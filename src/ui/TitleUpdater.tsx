import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Component that updates the document title based on the current language
 * This component doesn't render anything visually
 */
const TitleUpdater: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Update document title when language changes
    document.title = t("gameName");

    // This logs the current language for debugging purposes
    console.log("Language changed to:", i18n.language);
  }, [i18n.language, t]);

  // This component doesn't render anything visible
  return null;
};

export default TitleUpdater;
