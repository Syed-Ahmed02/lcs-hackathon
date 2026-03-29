import path from "node:path";
import { fileURLToPath } from "node:url";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./manifest.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
