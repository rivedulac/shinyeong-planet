import React, { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n/i18n";
import TitleUpdater from "../ui/TitleUpdater";

interface I18nProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app with i18n context
 * and includes the TitleUpdater for convenience
 */
const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <TitleUpdater />
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;
