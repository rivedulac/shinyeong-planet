import React from "react";
import { createRoot } from "react-dom/client";
import Game from "./game/Game";

// Import i18n configuration
import "./i18n/i18n";
import I18nProvider from "./i18n/i18nProvider";

// Render the game scene
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <Game />
    </I18nProvider>
  </React.StrictMode>
);

export default root;
