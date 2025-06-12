import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Create an alias '@' for the src directory
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
