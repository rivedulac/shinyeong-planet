import React from "react";
import { createRoot } from "react-dom/client";
import Game from "./components/Game";

// Render the game scene
const root = createRoot(document.getElementById("root")!);
root.render(<Game />);

export default root;
