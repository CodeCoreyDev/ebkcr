import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber, ROLE_LABELS } from "@/lib/clash";
import { buildWarHistory, MAX_DECKS_PER_WAR, sortPlayers } from "@/routes/-war-history";
import type { PlayerRow, WarCell, WarSortKey } from "@/routes/-war-history";

export const Route = createFileRoute("/war/history")({
  component: WarHistory,
});

type Mode = "decks" | "medals";

// Heatmap accent per mode: arena-blue for deck usage, gold for medals earned.
const ACCENT: Record<Mode, string> = { decks: "58,160,255", medals: "242,193,78" };

function rankColor(rank: number): string {
  return rank === 1 ? "text-gold" : rank <= 3 ? "text-victory" : "text-ink-muted";
}

/** Background + text color for a heatmap cell at the given metric intensity. */
function cellStyle(cell: WarCell, mode: Mode, maxFame: number): React.CSSProperties {
  const ratio =
    mode === "decks" ? cell.decksUsed / MAX_DECKS_PER_WAR : maxFame === 0 ? 0 : cell.fame / maxFame;
  const clamped = Math.min(1, Math.max(0, ratio));
  // Floor so a played-but-weak week still reads as filled, not empty.
  const alpha = 0.12 + 0.88 * clamped;
  return {
    backgroundColor: `rgba(${ACCENT[mode]},${alpha})`,
    color: clamped > 0.5 ? "#0b1220" : "#e6ecf5",
  };
}

const AGG_COLUMNS: { key: WarSortKey; label: string }[] = [
  { key: "warsPlayed", label: "Wars" },
  { key: "totalDecks", label: "Decks" },
  { key: "avgDecks", label: "Avg decks" },
  { key: "totalFame", label: "Medals" },
  { key: "avgFame", label: "Avg medals" },
];

function SortableTh({
  label,
  active,
  desc,
  align,
  onClick,
}: {
  label: string;
  active: boolean;
  desc: boolean;
  align: "left" | "right";
  onClick: () => void;
}) {
  return (
    <th
      className={`hover:text-ink cursor-pointer px-3 py-2 font-medium whitespace-nowrap select-none ${align === "right" ? "text-right" : "text-left"}`}
      onClick={onClick}
    >
      {label}
      {active ? <span className="text-gold"> {desc ? "▾" : "▴"}</span> : null}
    </th>
  );
}

function WarHistory() {
  const { columns, players, maxCellFame } = useMemo(() => buildWarHistory(), []);
  const [mode, setMode] = useState<Mode>("medals");
  const [currentOnly, setCurrentOnly] = useState(true);
  const [sort, setSort] = useState<WarSortKey>("totalFame");
  const [desc, setDesc] = useState(true);

  const visible = useMemo(
    () => (currentOnly ? players.filter((p) => p.isCurrentMember) : players),
    [players, currentOnly],
  );
  const sorted = useMemo(() => sortPlayers(visible, sort, desc), [visible, sort, desc]);

  function toggleSort(key: WarSortKey) {
    if (key === sort) {
      setDesc((d) => !d);
    } else {
      setSort(key);
      // Numbers read best high-first; names low-first.
      setDesc(key !== "name");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          to="/war"
          className="text-ink-muted hover:text-ink flex w-fit items-center gap-1 text-xs font-medium"
        >
          <ArrowLeft className="size-3.5" />
          Back to Clan War
        </Link>
        <h1 className="text-2xl font-black tracking-tight">War Participation</h1>
        <p className="text-ink-muted text-sm">
          {sorted.length} {currentOnly ? "current members" : "players"} across the last{" "}
          {columns.length} wars · click a column to sort
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-field-soft/60 border-card-border inline-flex rounded-lg border p-0.5 text-sm font-medium">
            {(["medals", "decks"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1 capitalize transition-colors ${
                  mode === m ? "bg-gold/15 text-gold" : "text-ink-muted hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="bg-field-soft/60 border-card-border inline-flex rounded-lg border p-0.5 text-sm font-medium">
            {(
              [
                ["current", "Current"],
                ["all", "All-time"],
              ] as const
            ).map(([value, label]) => {
              const active = currentOnly === (value === "current");
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCurrentOnly(value === "current")}
                  className={`rounded-md px-3 py-1 transition-colors ${
                    active ? "bg-gold/15 text-gold" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <Legend mode={mode} maxFame={maxCellFame} />
      </div>

      <Card className="overflow-x-auto">
        <table className="border-separate border-spacing-0 text-sm">
          <thead className="text-ink-muted text-xs tracking-wide uppercase">
            <tr>
              <th className="bg-card border-card-border sticky left-0 z-10 border-b px-3 py-2 text-left">
                <SortableInline
                  label="Player"
                  active={sort === "name"}
                  desc={desc}
                  onClick={() => toggleSort("name")}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-card-border border-b px-1.5 py-2 text-center font-medium"
                  title={`Season ${col.seasonId} · Week ${col.sectionIndex + 1} · finished #${col.rank}`}
                >
                  <div className="whitespace-nowrap">{col.label}</div>
                  <div className={`text-[11px] font-bold ${rankColor(col.rank)}`}>#{col.rank}</div>
                </th>
              ))}
              {AGG_COLUMNS.map((col) => (
                <SortableTh
                  key={col.key}
                  label={col.label}
                  active={sort === col.key}
                  desc={desc}
                  align="right"
                  onClick={() => toggleSort(col.key)}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <PlayerRowView
                key={p.tag}
                player={p}
                columns={columns}
                mode={mode}
                maxFame={maxCellFame}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SortableInline({
  label,
  active,
  desc,
  onClick,
}: {
  label: string;
  active: boolean;
  desc: boolean;
  onClick: () => void;
}) {
  return (
    <span className="hover:text-ink cursor-pointer select-none" onClick={onClick}>
      {label}
      {active ? <span className="text-gold"> {desc ? "▾" : "▴"}</span> : null}
    </span>
  );
}

function PlayerRowView({
  player,
  columns,
  mode,
  maxFame,
}: {
  player: PlayerRow;
  columns: ReturnType<typeof buildWarHistory>["columns"];
  mode: Mode;
  maxFame: number;
}) {
  return (
    <tr className="group">
      <td className="bg-card group-hover:bg-field-soft border-card-border/50 sticky left-0 z-10 border-b px-3 py-1.5">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-medium">{player.name}</span>
          {player.isCurrentMember ? (
            <Badge variant={player.role ?? "member"} className="px-1.5 py-0 text-[10px]">
              {ROLE_LABELS[player.role ?? "member"]}
            </Badge>
          ) : (
            <span className="text-ink-muted/60 text-[10px] tracking-wide uppercase">left</span>
          )}
        </div>
      </td>
      {columns.map((col, i) => {
        const cell = player.cells[i];
        return (
          <td key={col.key} className="border-card-border/50 border-b p-1 text-center">
            {cell ? (
              <div
                className="rounded font-mono text-xs leading-6 tabular-nums"
                style={cellStyle(cell, mode, maxFame)}
                title={`${col.label}: ${cell.decksUsed}/${MAX_DECKS_PER_WAR} decks · ${formatNumber(cell.fame)} medals`}
              >
                {mode === "decks" ? cell.decksUsed : formatNumber(cell.fame)}
              </div>
            ) : (
              <div className="text-ink-muted/25 leading-6">·</div>
            )}
          </td>
        );
      })}
      <Agg value={player.warsPlayed} />
      <Agg value={player.totalDecks} />
      <Agg value={player.avgDecks.toFixed(1)} />
      <Agg value={formatNumber(player.totalFame)} strong />
      <Agg value={formatNumber(player.avgFame)} />
    </tr>
  );
}

function Agg({ value, strong }: { value: string | number; strong?: boolean }) {
  return (
    <td
      className={`border-card-border/50 border-b px-3 py-1.5 text-right tabular-nums ${strong ? "text-gold font-semibold" : ""}`}
    >
      {value}
    </td>
  );
}

function Legend({ mode, maxFame }: { mode: Mode; maxFame: number }) {
  const max = mode === "decks" ? MAX_DECKS_PER_WAR : maxFame;
  const steps = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="text-ink-muted flex items-center gap-2 text-xs">
      <span>0</span>
      <div className="flex">
        {steps.map((s) => (
          <span
            key={s}
            className="size-4 first:rounded-l last:rounded-r"
            style={{ backgroundColor: `rgba(${ACCENT[mode]},${0.12 + 0.88 * s})` }}
          />
        ))}
      </div>
      <span>{mode === "decks" ? max : formatNumber(max)}</span>
    </div>
  );
}
