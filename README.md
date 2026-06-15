# ebkcr.com

Website for the **EBK** Clash Royale clan. Static site that displays clan stats,
the member roster, and clan war results pulled from the Clash Royale API.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **TanStack Router** (file-based routing in `src/routes/`)
- **Tailwind CSS v4**
- **oxlint** + **oxfmt** for lint/format
- No database, no per-visitor API calls — data is fetched at build time and
  baked into the bundle as static JSON.

## How the data works

`scripts/fetch-data.ts` calls the Clash Royale API and writes JSON into
`src/data/`. The app imports that JSON directly (`src/lib/clash.ts`), so:

- the API token never reaches the browser, and
- the site makes **zero** API calls when people visit it.

Data only refreshes when you fetch it again — manually, or on the weekly CI cron.
`src/data/*.json` is committed with placeholder **seed data** so the site builds
and runs before you've ever fetched.

## Getting an API token

1. Create an account at <https://developer.clashroyale.com/>.
2. Create a new API key. For the allowed IP address, enter the **RoyaleAPI proxy
   IP**: `45.79.218.79`. (Supercell ties tokens to fixed IPs; the proxy has a
   stable one, which is what lets the token work from CI and your laptop. The
   fetch script routes through `proxy.royaleapi.dev` by default.)
3. Copy the generated token (a long JWT).

## Local development

```bash
pnpm install
cp .env.example .env        # then fill in CR_API_TOKEN and CLAN_TAG
pnpm fetch-data             # pulls live data into src/data/ (optional)
pnpm dev                    # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm preview`, `pnpm check` (lint+format),
`pnpm fix`, `pnpm typecheck`.

## Deploying (GitHub Pages)

Deploys are handled by `.github/workflows/deploy.yml`, which runs on:

- every push to `main`,
- a **weekly schedule** (Mondays 12:00 UTC), and
- manual trigger (Actions tab → "Run workflow").

Each run re-fetches clan data, builds, and publishes to GitHub Pages.

### One-time setup

1. **Settings → Pages → Source:** GitHub Actions.
2. **Settings → Secrets and variables → Actions:**
   - Secret `CR_API_TOKEN` = your API token.
   - Variable `CLAN_TAG` = your clan tag, e.g. `#2P0LYQ`.
   - (If `CR_API_TOKEN` is unset, the build still succeeds using seed data.)
3. **Custom domain:** `public/CNAME` already contains `ebkcr.com`. Point your
   DNS at GitHub Pages:
   - apex `ebkcr.com` → A records `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` → CNAME `<your-github-username>.github.io`

   Then enable "Enforce HTTPS" in Settings → Pages.

## Project layout

```
scripts/fetch-data.ts     # build-time Clash Royale API fetcher
src/data/*.json           # fetched (or seed) clan data — imported by the app
src/lib/clash.ts          # data types, loaders, formatting helpers
src/routes/               # file-based routes: / (overview), /members, /war
src/components/           # UI components (ui/ holds primitives)
```
