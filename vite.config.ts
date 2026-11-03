import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/goout-filters-ux-concept/",
  plugins: [react()],
  build: {
    rolldownOptions: {
      // Two pages: the listing and the case study.
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        caseStudy: resolve(import.meta.dirname, "case-study.html"),
      },
    },
  },
});
