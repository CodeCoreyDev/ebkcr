/// <reference types="vite/client" />

// Injected at build time by Vite's `define` (see vite.config.ts) from the
// CR_API_TOKEN / CLAN_TAG / CR_API_BASE env vars. Used by the browser-side
// live data fetcher in src/lib/clash-data.tsx.
declare const __CR_API_TOKEN__: string;
declare const __CLAN_TAG__: string;
declare const __CR_API_BASE__: string;
