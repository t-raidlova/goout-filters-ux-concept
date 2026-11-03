import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/goout-filters-ux-concept/",
  plugins: [react()],
});
