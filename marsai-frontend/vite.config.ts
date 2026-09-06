// vite.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  publicDir: "src/public",
  resolve: {
    alias: {},
  },
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
  },
  server: {
    host: true,
  },
  build: {
    sourcemap: true,
  },
});
