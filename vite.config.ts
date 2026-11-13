import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite"; // Import the new Vite plugin
import path from "path";
import externalGlobals from "rollup-plugin-external-globals";

export default defineConfig({
  plugins: [
    react(),
    externalGlobals({
      react: "React",
      "react-dom": "ReactDOM",
      dayjs: "dayjs",
      antd: "antd",
      "pdf-lib": "PDFLib",
      "@pdf-lib/fontkit": "fontkit",
      "pdfjs-dist": "pdfjsLib",
    }) /* tailwindcss()*/,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Create an alias '@' for the src directory
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    target: "es2015", // IIFE ต้องใช้ target นี้
    modulePreload: false, // ห้ามสร้าง script แทรกเพิ่ม
    cssCodeSplit: false, // ต้องได้ CSS ไฟล์เดียว
    assetsInlineLimit: 204800, // รูป < 200KB จะกลายเป็น base64 ใน CSS/JS (GAS serve ไฟล์ asset ไม่ได้)
    outDir: "dist",
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "dayjs",
        "antd",
        "pdf-lib",
        "@pdf-lib/fontkit",
        "pdfjs-dist",
      ],
      output: {
        format: "iife", // ห้ามเป็น es เด็ดขาด (GAS รัน classic script)
        name: "PdfEditorApp",
      },
    },
  },
});
