import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react({
    jsxImportSource: 'react',
  })],
  root: ".",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: "../public",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: `assets/[name]-[hash].[ext]`,
        chunkFileNames: `assets/[name]-[hash].js`,
        entryFileNames: `assets/[name]-[hash].js`,
      }
    }
  },
});