/**
 * Build-time Clash Royale data fetcher.
 *
 * Pulls clan data from the Clash Royale API and writes it to `src/data/*.json`,
 * which the site imports statically. This means:
 *   - the API token never reaches the browser,
 *   - we make zero API calls per visitor, and
 *   - data only refreshes when we choose to (locally or via the weekly CI cron).
 *
 * Run locally:   pnpm fetch-data        (reads .env)
 * Run in CI:     env CR_API_TOKEN=... CLAN_TAG=... pnpm fetch-data
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(scriptDir, "..", "src", "data");

const TOKEN = process.env.CR_API_TOKEN;
const CLAN_TAG = process.env.CLAN_TAG ?? "#PLACEHOLDER";
const BASE = (process.env.CR_API_BASE ?? "https://proxy.royaleapi.dev/v1").replace(/\/$/, "");

if (!TOKEN) {
  console.error(
    "Missing CR_API_TOKEN. Copy .env.example to .env and add your token,\n" +
      "or set it in the environment. See README.md for how to get one.",
  );
  process.exit(1);
}

if (CLAN_TAG === "#PLACEHOLDER") {
  console.error("CLAN_TAG is still the placeholder. Set it in .env (e.g. CLAN_TAG=#2P0LYQ).");
  process.exit(1);
}

/** Clan tags use `#`, which must be percent-encoded as %23 in the URL path. */
const encodedTag = encodeURIComponent(CLAN_TAG);

async function get<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${path} → ${res.status} ${res.statusText}\n${body}`);
  }
  return (await res.json()) as T;
}

async function write(name: string, data: unknown) {
  await writeFile(join(DATA_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`  ✓ wrote src/data/${name}`);
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  console.log(`Fetching clan ${CLAN_TAG} via ${BASE} …`);

  // Each endpoint is independent — fetch them concurrently.
  const [clan, currentRiverRace, riverRaceLog] = await Promise.all([
    get(`/clans/${encodedTag}`),
    // These can 404 for brand-new clans or off-season; tolerate that.
    get(`/clans/${encodedTag}/currentriverrace`).catch(() => null),
    get<{ items: unknown[] }>(`/clans/${encodedTag}/riverracelog`).catch(() => ({ items: [] })),
  ]);

  await write("clan.json", clan);
  await write("current-river-race.json", currentRiverRace);
  await write("river-race-log.json", riverRaceLog);
  await write("meta.json", {
    clanTag: CLAN_TAG,
    fetchedAt: new Date().toISOString(),
    source: BASE,
  });

  console.log("Done.");
}

main().catch((err) => {
  console.error("\nFetch failed:\n", err instanceof Error ? err.message : err);
  process.exit(1);
});
