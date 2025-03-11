import React from "react";
import { createRoot } from "react-dom/client";
import GameScene from "./components/GameScene";

// Render the game scene
const root = createRoot(document.getElementById("root")!);
root.render(<GameScene />);

export default root;
