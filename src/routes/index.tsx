import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Crown, Trophy, Users } from "lucide-react";

import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeClanStats, computeRecentWar, formatNumber, ROLE_LABELS } from "@/lib/clash";
import type { RecentWar } from "@/lib/clash";
import { useClashData } from "@/lib/clash-data";

export const Route = createFileRoute("/")({
  component: Overview,
});

/** How many war performers the landing-page leaderboard lists. */
const TOP_PREDS = 5;

/** Podium tint for the rank badge; see `.cr-place-*` in styles.css. */
const PLACE_TINT: Record<number, string> = {
  1: "cr-place-gold",
  2: "cr-place-silver",
  3: "cr-place-bronze",
};

/** e.g. "Season 133 · Week 2 · Jun 15" */
function warLabel(war: RecentWar): string {
  const week = `Season ${war.seasonId} · Week ${war.sectionIndex + 1}`;
  return war.date
    ? `${week} · ${war.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : week;
}

/**
 * The page's headline act: whoever pulled the most war medals last war, over
 * the Clash key art with their name in animated gold.
 *
 * Deliberately thin on data. The supporting numbers — decks used, where the
 * clan finished, which war this was — all live in the leaderboard below, and
 * hanging them off the name turns a victory lap into a stat block. The one
 * figure that stays is the medal count, because it's the reason they're up
 * here at all.
 */
function ApexPredator({ war }: { war: RecentWar }) {
  const champ = war.performers[0]!;
  return (
    <section className="cr-hero">
      {/* Decorative: the champion's name is the heading, and the art carries no
          information the text doesn't. Eager + high priority since this is the
          largest paint above the fold. */}
      <img
        src="/hero-2.png"
        alt=""
        aria-hidden="true"
        className="cr-hero-art"
        fetchPriority="high"
      />

      {/* Above the name, not below it: the award frames the winner, and reading
          the biggest text on the page before knowing what it won is backwards. */}
      <p className="cr-hero-eyebrow">Apex Predator</p>

      {/* `data-name` feeds the gold layer's `content: attr()`; see `.cr-gold-name`. */}
      <h1 className="cr-gold-name text-[clamp(2.25rem,9vw,4.5rem)]" data-name={champ.name}>
        {champ.name}
      </h1>

      <span className="cr-chip cr-chip-gold cr-hero-medals">
        {formatNumber(champ.medals)} medals
      </span>
    </section>
  );
}

/** The medal leaderboard for that same war — the old trophy list, re-aimed. */
function TopPreds({ war }: { war: RecentWar }) {
  return (
    <Card>
      {/* `items-start` rather than `center`: the title block is two lines now
          that it carries the war label, and centering floats the link. */}
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Top EBK Preds</CardTitle>
          <p className="text-ink-muted text-xs">
            {warLabel(war)} · clan finished #{war.clanRank}
          </p>
        </div>
        <Link
          to="/war/history"
          className="text-arena shrink-0 text-xs font-semibold hover:underline"
        >
          War history →
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {war.performers.slice(0, TOP_PREDS).map((p) => (
          <div
            key={p.tag}
            className={`cr-item flex items-center justify-between gap-3 ${
              p.place === 1 ? "cr-item-gold" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Placement sits in a recessed slot; see `.cr-place` in styles.css.
                  Anything past third has no tint and takes the row's colors. */}
              <span className={`cr-place ${PLACE_TINT[p.place] ?? ""}`}>{p.place}</span>
              <div className="flex flex-col gap-2">
                <span className="cr-title leading-6">{p.name}</span>
                <span className="text-ink-muted/80 cr-stat flex items-center gap-1 text-xs">
                  {p.role && ROLE_LABELS[p.role]}
                </span>
              </div>
            </div>
            <span className={`cr-chip shrink-0 ${p.place === 1 ? "cr-chip-gold" : ""}`}>
              {formatNumber(p.medals)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Overview() {
  const { data } = useClashData();
  const { clan } = data;
  const stats = computeClanStats(clan);
  const recentWar = computeRecentWar(clan, data.riverRaceLog);

  return (
    <div className="flex flex-col gap-8">
      {/* Optional photographic backdrop; see `--home-bg-image` in src/styles.css. */}
      <div className="home-backdrop" aria-hidden="true" />

      {/* No clan header here on purpose — the name and crest are already in the
          nav bar on every page, and repeating them pushed the one thing this
          page exists to show below the fold. */}
      {recentWar ? <ApexPredator war={recentWar} /> : null}

      <section>
        {recentWar ? (
          <TopPreds war={recentWar} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top EBK Preds</CardTitle>
            </CardHeader>
            <CardContent className="text-ink-muted text-sm">
              No completed wars yet — medals show up here once a river race wraps.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Trophy} label="Clan Score" value={formatNumber(clan.clanScore)} />
        <StatCard icon={Users} label="Members" value={`${stats.memberCount}/50`} />
        <StatCard
          icon={Coins}
          label="Donations / wk"
          value={formatNumber(clan.donationsPerWeek || stats.totalDonations)}
        />
        <StatCard icon={Crown} label="Avg Trophies" value={formatNumber(stats.avgTrophies)} />
      </section>
    </div>
  );
}
