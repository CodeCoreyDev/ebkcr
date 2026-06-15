import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Custom domain (ebkcr.com) serves from the apex, so the base path is "/".
// If you ever serve from a project subpath instead, set base to "/<repo>/".
export default defineConfig({
  base: "/",
  resolve: {
    // Native resolution of the "@/*" alias from tsconfig.json.
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    // The router plugin must come before the React plugin.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
});
