import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { gadget } from "gadget-server/vite";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [gadget(), react(), tailwindcss()],
  clearScreen: false,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "web"),
    },
  },
});
