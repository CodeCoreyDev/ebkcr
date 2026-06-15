import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Shield } from "lucide-react";

import { clan, formatFetchedAt } from "@/lib/clash";

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
});

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-card-border/70 bg-field/80 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="text-gold size-6" strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight">
              {clan.name}
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
        Data updated {formatFetchedAt()} · Sourced from the Clash Royale API ·{" "}
        <a href="https://ebkcr.com" className="hover:text-ink">
          ebkcr.com
        </a>
      </footer>
    </div>
  );
}
