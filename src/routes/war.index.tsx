import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Swords } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, parseClashDate } from "@/lib/clash";
import type { CurrentRiverRace, RiverRaceLogEntry } from "@/lib/clash";
import { useClashData } from "@/lib/clash-data";

export const Route = createFileRoute("/war/")({
  component: War,
});

function CurrentRace({ currentRiverRace }: { currentRiverRace: CurrentRiverRace | null }) {
  if (!currentRiverRace || currentRiverRace.clans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current River Race</CardTitle>
        </CardHeader>
        <CardContent className="text-ink-muted text-sm">
          No active river race right now. Check back during war days.
        </CardContent>
      </Card>
    );
  }

  // Local const so the non-null narrowing carries into the .map() closure below.
  const race = currentRiverRace;
  const standings = [...race.clans].sort((a, b) => b.fame - a.fame);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current River Race · {race.periodType}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {standings.map((c, i) => {
          const isUs = c.tag === race.clan.tag;
          return (
            <div
              key={c.tag}
              className={`cr-item flex items-center justify-between gap-3 ${isUs ? "cr-item-gold" : ""}`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`font-display w-5 text-right text-sm font-bold ${isUs ? "text-gold" : "text-ink-muted"}`}
                >
                  {i + 1}
                </span>
                {/* No truncation: clan names are length-capped in game, so they
                    always fit. `leading-6` keeps the outline's drop off the row
                    edge — `.cr-title`'s own 1.1 is tuned for headings. */}
                <span className="cr-title leading-6">{c.name}</span>
              </span>
              <span className={`shrink-0 ${isUs ? "cr-chip cr-chip-gold" : "cr-chip"}`}>
                {formatNumber(c.fame)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function WarLog({
  riverRaceLog,
  currentRiverRace,
}: {
  riverRaceLog: RiverRaceLogEntry[];
  currentRiverRace: CurrentRiverRace | null;
}) {
  if (riverRaceLog.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War History</CardTitle>
        </CardHeader>
        <CardContent className="text-ink-muted text-sm">No war history yet.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>War History</CardTitle>
        <Link
          to="/war/history"
          className="text-arena flex items-center gap-1 text-xs font-medium hover:underline"
        >
          <History className="size-3.5" />
          Participation heatmap →
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {riverRaceLog.map((entry) => {
          const ours = entry.standings.find((s) => s.clan.tag === currentRiverRace?.clan.tag);
          const rank = ours?.rank ?? entry.standings[0]?.rank ?? 0;
          const date = parseClashDate(entry.createdDate);
          const rankColor =
            rank === 1 ? "text-gold" : rank <= 3 ? "text-victory" : "text-ink-muted";
          return (
            <div
              key={`${entry.seasonId}-${entry.sectionIndex}`}
              className="cr-item flex items-center justify-between gap-3"
            >
              <span className="text-ink-muted text-sm">
                Season {entry.seasonId} · Week {entry.sectionIndex + 1}
                {date
                  ? ` · ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : ""}
              </span>
              <span className={`cr-stat shrink-0 text-xl ${rankColor}`}>#{rank}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function War() {
  const { data } = useClashData();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <Swords className="size-7 text-[#ffc21c] drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
        <h1 className="cr-title text-3xl">Clan War</h1>
      </div>
      <CurrentRace currentRiverRace={data.currentRiverRace} />
      <WarLog riverRaceLog={data.riverRaceLog} currentRiverRace={data.currentRiverRace} />
    </div>
  );
}
