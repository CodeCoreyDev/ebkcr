import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Shield } from "lucide-react";

import { formatFetchedAt, formatRelativeTime } from "@/lib/clash";
import { useClashData } from "@/lib/clash-data";

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-ink-muted hover:text-ink rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
      activeProps={{ className: "!text-gold bg-gold/10" }}
      activeOptions={{ exact: to === "/" }}
    >
      {label}
    </Link>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <img src="/King_Sweating.webp" alt="Sweating King" className="size-40 object-contain" />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">404 — Page Not Found</h1>
        <p className="text-ink-muted max-w-md text-sm">
          Looks like this page got knocked out of the arena.
        </p>
      </div>
      <Link
        to="/"
        className="border-gold/30 bg-gold/10 text-gold hover:bg-gold/20 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
      >
        Go Back
      </Link>
    </div>
  );
}

/** Footer line describing how fresh the currently-shown data is. */
function Freshness() {
  const { status, data } = useClashData();
  if (status === "loading") return <span>Refreshing live data…</span>;
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="bg-victory inline-block size-1.5 animate-pulse rounded-full" />
        Live · updated {formatRelativeTime(data.meta.fetchedAt ?? "")}
      </span>
    );
  }
  // seed or error: fall back to the build-time snapshot date.
  return <span>Data updated {formatFetchedAt(data.meta.fetchedAt)}</span>;
}

function RootLayout() {
  const { data } = useClashData();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-card-border/70 bg-field/80 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="text-gold size-6" strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight">
              {data.clan.name}
              <span className="text-ink-muted"> · Clash Royale</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" label="Overview" />
            <NavLink to="/members" label="Members" />
            <NavLink to="/war" label="Clan War" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-card-border/70 text-ink-muted border-t px-4 py-6 text-center text-xs">
        <Freshness /> · Sourced from the Clash Royale API ·{" "}
        <a href="https://ebkcr.com" className="hover:text-ink">
          ebkcr.com
        </a>
      </footer>
    </div>
  );
}
