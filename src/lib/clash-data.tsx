/**
 * Browser-side live data layer.
 *
 * The site ships with a build-time seed dataset (`seedData`) for an instant
 * first paint. On load — and again whenever the tab regains focus after a
 * short cooldown — we refetch straight from the Clash Royale API so visitors
 * always see current standings and an accurate "last seen". Since this runs in
 * the browser, the API token is inlined into the bundle by Vite (see
 * vite.config.ts); the token is read-only and proxy-allowlisted, so the only
 * exposure is rate-limit abuse.
 *
 * If no token is configured, or a fetch fails, we silently keep the seed data.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { seedData } from "@/lib/clash";
import type { ClashData, Clan, CurrentRiverRace, RiverRaceLogEntry } from "@/lib/clash";

const TOKEN = __CR_API_TOKEN__;
const CLAN_TAG = __CLAN_TAG__;
const BASE = __CR_API_BASE__.replace(/\/$/, "");

/** Don't even attempt a live fetch without a real token + clan tag. */
const liveFetchEnabled =
  Boolean(TOKEN) && CLAN_TAG !== "#PLACEHOLDER" && CLAN_TAG.replace(/^#/, "") !== "";

/** Skip refetch-on-focus if we refreshed within this window (ms). */
const REFETCH_COOLDOWN_MS = 60_000;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Pull the three clan endpoints concurrently, mirroring scripts/fetch-data.ts. */
export async function fetchClashData(): Promise<ClashData> {
  const tag = encodeURIComponent(CLAN_TAG);
  const [clan, currentRiverRace, riverRaceLog] = await Promise.all([
    get<Clan>(`/clans/${tag}`),
    // These 404 for brand-new clans or off-season; tolerate that.
    get<CurrentRiverRace>(`/clans/${tag}/currentriverrace`).catch(() => null),
    get<{ items: RiverRaceLogEntry[] }>(`/clans/${tag}/riverracelog`).catch(() => ({
      items: [] as RiverRaceLogEntry[],
    })),
  ]);
  return {
    clan,
    currentRiverRace,
    riverRaceLog: riverRaceLog.items,
    meta: { clanTag: CLAN_TAG, fetchedAt: new Date().toISOString(), source: BASE },
  };
}

export type DataStatus = "seed" | "loading" | "live" | "error";

interface DataState {
  data: ClashData;
  status: DataStatus;
  refresh: () => void;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ClashData>(seedData);
  const [status, setStatus] = useState<DataStatus>(liveFetchEnabled ? "loading" : "seed");
  // Wall-clock of the last successful/attempted fetch, for the focus cooldown.
  const lastFetch = useRef(0);
  // Guards against overlapping fetches (and StrictMode's double-mount in dev).
  const inFlight = useRef(false);

  const refresh = useCallback(() => {
    if (!liveFetchEnabled || inFlight.current) return;
    inFlight.current = true;
    lastFetch.current = Date.now();
    setStatus("loading");
    fetchClashData()
      .then((fresh) => {
        setData(fresh);
        setStatus("live");
      })
      .catch(() => setStatus("error"))
      .finally(() => {
        inFlight.current = false;
      });
  }, []);

  // Fetch on first load.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh when the visitor returns to the tab (e.g. back-navigation), but no
  // more than once per cooldown so quick tab-flicking doesn't hammer the API.
  useEffect(() => {
    if (!liveFetchEnabled) return;
    function onVisible() {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastFetch.current > REFETCH_COOLDOWN_MS
      ) {
        refresh();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  return <DataContext.Provider value={{ data, status, refresh }}>{children}</DataContext.Provider>;
}

export function useClashData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useClashData must be used within <DataProvider>");
  return ctx;
}
