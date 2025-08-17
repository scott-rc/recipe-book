import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { gadget } from "gadget-server/vite";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [gadget(), reactRouter(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "web"),
    },
  },
});
