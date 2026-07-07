import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Custom domain (ebkcr.com) serves from the apex, so the base path is "/".
// If you ever serve from a project subpath instead, set base to "/<repo>/".
export default defineConfig(({ mode }) => {
  // Inline the same env names the build-time fetcher uses (process.env in CI,
  // .env locally) so the browser can refresh clan data live on each visit.
  // WARNING: this publishes the API token in the client bundle — acceptable
  // only because the token is read-only and allowlisted to the RoyaleAPI proxy.
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const pick = (key: string) => process.env[key] ?? fileEnv[key] ?? "";

  return {
    base: "/",
    resolve: {
      // Native resolution of the "@/*" alias from tsconfig.json.
      tsconfigPaths: true,
    },
    define: {
      __CR_API_TOKEN__: JSON.stringify(pick("CR_API_TOKEN")),
      __CLAN_TAG__: JSON.stringify(pick("CLAN_TAG") || "#PLACEHOLDER"),
      __CR_API_BASE__: JSON.stringify(pick("CR_API_BASE") || "https://proxy.royaleapi.dev/v1"),
    },
    plugins: [
      tailwindcss(),
      // The router plugin must come before the React plugin.
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
    ],
  };
});
