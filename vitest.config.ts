import { defineConfig } from "vitest/config";
import  path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
    resolve: {
    alias: {
      "@assets":     path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@contexts":   path.resolve(__dirname, "src/contexts"),
      "@hooks":      path.resolve(__dirname, "src/hooks"),
      "@pages":      path.resolve(__dirname, "src/pages"),
      "@services":   path.resolve(__dirname, "src/services"),
      "@styles":     path.resolve(__dirname, "src/styles"),
      "@utils":      path.resolve(__dirname, "src/utils"),
      "@shared":     path.resolve(__dirname, "src/shared"),
      "@tests":      path.resolve(__dirname, "src/__tests__"),
    },
  },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./setupTests.tsx",
    },
});