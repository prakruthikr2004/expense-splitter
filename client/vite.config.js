import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://expense-splitter-nsts.onrender.com" // only for dev
    }
  },
  build: {
    outDir: "build", // <- production output folder for Vercel
  },
});
