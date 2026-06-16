import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Swords } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentRiverRace, formatNumber, parseClashDate, riverRaceLog } from "@/lib/clash";

export const Route = createFileRoute("/war/")({
  component: War,
});

function CurrentRace() {
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
      <CardContent className="flex flex-col gap-1">
        {standings.map((c, i) => {
          const isUs = c.tag === race.clan.tag;
          return (
            <div
              key={c.tag}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${isUs ? "bg-gold/10 ring-gold/30 ring-1" : "hover:bg-field-soft/60"}`}
            >
              <span className="flex items-center gap-3">
                <span className="text-ink-muted w-5 text-right font-mono">{i + 1}</span>
                <span className={isUs ? "text-gold font-bold" : "font-medium"}>{c.name}</span>
              </span>
              <span className="font-semibold">{formatNumber(c.fame)} fame</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function WarLog() {
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
              className="border-card-border/60 flex items-center justify-between rounded-lg border px-3 py-2.5"
            >
              <span className="text-ink-muted text-sm">
                Season {entry.seasonId} · Week {entry.sectionIndex + 1}
                {date
                  ? ` · ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : ""}
              </span>
              <span className={`text-lg font-black ${rankColor}`}>#{rank}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function War() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Swords className="text-gold size-6" />
        <h1 className="text-2xl font-black tracking-tight">Clan War</h1>
      </div>
      <CurrentRace />
      <WarLog />
    </div>
  );
}
