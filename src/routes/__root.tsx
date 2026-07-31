import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Moon, Shield, Sun } from "lucide-react";

import { formatFetchedAt, formatRelativeTime } from "@/lib/clash";
import { useClashData } from "@/lib/clash-data";
import { useTheme } from "@/lib/theme";

/**
 * Nav tab. Inactive tabs are flat so the bar stays quiet; the active one lifts
 * into a gold plate with the same hard bottom edge as `.cr-btn`, which is what
 * makes it read as a physical selected tab rather than a highlight.
 *
 * Fixed white-alpha rather than the ink tokens: the header stays navy in both
 * themes, and `--color-ink` flips to near-black, which would erase the nav in
 * light mode. Everything drawn on the chrome follows this rule.
 */
function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="font-display rounded-lg px-3 py-1.5 text-sm font-bold text-white/65 transition-colors hover:text-white sm:px-4"
      activeProps={{
        className:
          "!text-white bg-gradient-to-b from-[#ffd54a] to-[#f0a80c] shadow-[inset_0_2px_0_#ffeaa0,0_3px_0_#7d3f00] cr-title",
      }}
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
      <div className="flex flex-col gap-3">
        <h1 className="cr-title text-4xl">404</h1>
        <p className="text-onfield-muted max-w-md text-sm">
          Looks like this page got knocked out of the arena.
        </p>
      </div>
      <Link to="/" className="cr-btn">
        Back to Base
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
        <span className="inline-block size-1.5 animate-pulse rounded-full bg-[#4ad07f]" />
        Live · updated {formatRelativeTime(data.meta.fetchedAt ?? "")}
      </span>
    );
  }
  // seed or error: fall back to the build-time snapshot date.
  return <span>Data updated {formatFetchedAt(data.meta.fetchedAt)}</span>;
}

/**
 * Light/dark switch. Colored against the navy header rather than the page tokens
 * — the chrome doesn't flip, so the button shouldn't either.
 */
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  );
}

function RootLayout() {
  const { data } = useClashData();
  return (
    <div className="flex min-h-screen flex-col">
      {/* Arena backdrop; fixed behind everything. See `.cr-lattice` in styles.css. */}
      <div className="cr-lattice" aria-hidden="true" />

      {/* Solid navy rather than a blur: over the lattice, a translucent bar smears
          the diamonds into a band of mush right where the nav has to stay legible. */}
      <header className="bg-navy sticky top-0 z-20 border-b-4 border-black/40 shadow-lg shadow-black/30">
        {/* Stacks on phones: side by side, three nav tabs and a clan name of any
            length can't both fit, and the name is the first thing to get chopped. */}
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-2.5 sm:flex-row sm:justify-between sm:gap-3 sm:py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <Shield className="size-7 shrink-0 text-[#ffc21c] drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
            <span className="cr-title truncate text-xl sm:text-2xl">{data.clan.name}</span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1">
            <NavLink to="/" label="Overview" />
            <NavLink to="/members" label="Members" />
            <NavLink to="/war" label="Clan War" />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-navy border-t-4 border-black/40 px-4 py-6 text-center text-xs text-white/60">
        <Freshness /> · Sourced from the Clash Royale API ·{" "}
        <a href="https://ebkcr.com" className="transition-colors hover:text-[#ffc21c]">
          ebkcr.com
        </a>
      </footer>
    </div>
  );
}
