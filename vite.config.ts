import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite"; // Import the new Vite plugin
import path from "path";

export default defineConfig({
  plugins: [react() /* tailwindcss()*/],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Create an alias '@' for the src directory
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
