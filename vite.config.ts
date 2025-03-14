import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { defineConfig as defineVitestConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  // Add SVG handling
  optimizeDeps: {
    include: ["**/*.svg"],
  },
  assetsInclude: ["**/*.svg"],
  // Add test configuration
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
