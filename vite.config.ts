import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// One self-contained index.html: it runs from a double-click (file://), a static host, or a wrapper like Tauri.
export default defineConfig({
  base: "./",
  plugins: [preact(), viteSingleFile()],
  build: { target: "es2020", cssCodeSplit: false },
});
