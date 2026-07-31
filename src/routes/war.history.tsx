import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronsUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber, formatRelativeTime, ROLE_LABELS } from "@/lib/clash";
import { useClashData } from "@/lib/clash-data";
import { buildWarHistory, sortPlayers } from "@/routes/-war-history";
import type { PlayerRow, WarSortKey } from "@/routes/-war-history";

export const Route = createFileRoute("/war/history")({
  component: WarHistory,
});

/*
 * War-medal (fame) thresholds. Below DEMOTE a player is underperforming (the cell
 * washes red); PROMOTE is the bar a Member must clear last war to earn a promotion
 * nudge. Everything else is a subtle-blue heatmap scaled by medals earned.
 */
const MEDAL_DEMOTE = 2000;
const MEDAL_PROMOTE = 2500;

function rankColor(rank: number): string {
  return rank === 1 ? "text-gold" : rank <= 3 ? "text-victory" : "text-ink-muted";
}

/**
 * Medals heatmap. A week fills the whole cell with a subtle blue whose strength
 * scales with medals earned — fading all the way to transparent as it approaches
 * the demote line, so the blue spans its full range across 2000→max. A week below
 * the demote line washes a soft red instead. Fills stay translucent so the number
 * reads in both light and dark.
 */
function medalCellStyle(fame: number, maxFame: number): CSSProperties {
  if (fame < MEDAL_DEMOTE) return { backgroundColor: "rgba(239,68,68,0.18)" };
  const span = Math.max(1, maxFame - MEDAL_DEMOTE);
  const ratio = Math.min(1, (fame - MEDAL_DEMOTE) / span);
  return { backgroundColor: `rgba(58,160,255,${(0.32 * ratio).toFixed(3)})` };
}

const AGG_COLUMNS: { key: WarSortKey; label: string }[] = [
  { key: "warsPlayed", label: "Wars" },
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
      className={`hover:text-gold border-line cursor-pointer border-b px-3 py-2.5 whitespace-nowrap select-none ${align === "right" ? "text-right" : "text-left"} ${active ? "text-gold" : ""}`}
      onClick={onClick}
    >
      {label}
      {active ? <span className="text-gold"> {desc ? "▾" : "▴"}</span> : null}
    </th>
  );
}

function WarHistory() {
  const { data } = useClashData();
  const { columns, players, maxCellFame } = useMemo(
    () => buildWarHistory(data.clan, data.riverRaceLog),
    [data.clan, data.riverRaceLog],
  );
  const [currentOnly, setCurrentOnly] = useState(true);
  // Default to the most recent war — the newest column is index 0 after the reverse.
  const [sort, setSort] = useState<WarSortKey>("col:0");
  const [desc, setDesc] = useState(true);

  const visible = useMemo(
    () => (currentOnly ? players.filter((p) => p.isCurrentMember) : players),
    [players, currentOnly],
  );
  const sorted = useMemo(() => sortPlayers(visible, sort, desc, "medals"), [visible, sort, desc]);

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
          className="text-onfield-muted flex w-fit items-center gap-1 text-xs font-semibold transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Back to Clan War
        </Link>
        <h1 className="cr-title mt-1 text-3xl">War Participation</h1>
        <p className="text-onfield-muted text-sm">
          {sorted.length} {currentOnly ? "current members" : "players"} across the last{" "}
          {columns.length} wars · click a column to sort
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented control, built to match the nav tabs: the selected side
              lifts into a gold plate, the other stays flat. */}
          <div className="inline-flex rounded-xl border border-black/40 bg-black/25 p-1 text-sm shadow-[inset_0_2px_4px_rgb(0_0_0/0.35)]">
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
                  className={`font-display rounded-lg px-3 py-1 font-bold transition-colors ${
                    active
                      ? "bg-gradient-to-b from-[#ffd54a] to-[#f0a80c] text-white shadow-[inset_0_2px_0_#ffeaa0,0_2px_0_#7d3f00] [text-shadow:0_1px_0_#8a4200]"
                      : "text-onfield-muted hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <Legend maxFame={maxCellFame} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead className="text-gold-soft bg-thead text-[11px] font-bold tracking-wider uppercase">
            <tr>
              {/* Sticky cells can't use the translucent `--color-thead` — the
                  columns they're meant to occlude would scroll through underneath —
                  so they take its opaque twin instead. */}
              <th className="border-line bg-sticky-head sticky left-0 z-10 border-b px-3 py-2.5 text-left">
                <SortableInline
                  label="Player"
                  active={sort === "name"}
                  desc={desc}
                  onClick={() => toggleSort("name")}
                />
              </th>
              {columns.map((col, i) => {
                const colKey: WarSortKey = `col:${i}`;
                const active = sort === colKey;
                return (
                  <th
                    key={col.key}
                    className={`hover:text-gold border-line cursor-pointer border-b px-1.5 py-2.5 text-center select-none ${active ? "text-gold" : ""}`}
                    title={`Season ${col.seasonId} · Week ${col.sectionIndex + 1} · finished #${col.rank} · click to sort by this week's medals`}
                    onClick={() => toggleSort(colKey)}
                  >
                    <div className="whitespace-nowrap">
                      {col.label}
                      {active ? <span className="text-gold"> {desc ? "▾" : "▴"}</span> : null}
                    </div>
                    <div
                      className={`text-[11px] font-bold ${active ? "text-gold" : rankColor(col.rank)}`}
                    >
                      #{col.rank}
                    </div>
                  </th>
                );
              })}
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
              <PlayerRowView key={p.tag} player={p} columns={columns} maxFame={maxCellFame} />
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

/** Only rank-and-file members earn a promotion nudge — elders and up don't. */
function isPromotable(role: PlayerRow["role"]): boolean {
  return role === "member";
}

function PlayerRowView({
  player,
  columns,
  maxFame,
}: {
  player: PlayerRow;
  columns: ReturnType<typeof buildWarHistory>["columns"];
  maxFame: number;
}) {
  // Newest war is column 0 (buildWarHistory reverses so newest is leftmost).
  const latestFame = player.cells[0]?.fame ?? 0;
  const needsPromotion =
    player.isCurrentMember && isPromotable(player.role) && latestFame >= MEDAL_PROMOTE;

  return (
    <tr className="group">
      <td className="bg-sticky group-hover:bg-field-soft border-line sticky left-0 z-10 border-b px-3 py-1.5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-medium">{player.name}</span>
            {player.isCurrentMember ? (
              <Badge variant={player.role ?? "member"} className="px-1.5 py-0 text-[10px]">
                {ROLE_LABELS[player.role ?? "member"]}
              </Badge>
            ) : (
              <span className="text-ink-muted/60 text-[10px] tracking-wide uppercase">left</span>
            )}
            {needsPromotion ? (
              <span
                title={`Earned ${formatNumber(latestFame)} medals last war — promotion candidate`}
                className="bg-victory/10 text-victory inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase"
              >
                <ChevronsUp className="size-3" />
                Promote
              </span>
            ) : null}
          </div>
          {player.lastSeen ? (
            <span className="text-ink-muted/70 text-[10px] whitespace-nowrap">
              Last seen: {formatRelativeTime(player.lastSeen)}
            </span>
          ) : null}
        </div>
      </td>
      {columns.map((col, i) => {
        const cell = player.cells[i];
        return (
          <td
            key={col.key}
            className="group-hover:bg-field-soft border-line border-b p-0 text-center"
          >
            {cell ? (
              <div
                className="px-1.5 py-1 font-mono text-xs leading-5 tabular-nums"
                style={medalCellStyle(cell.fame, maxFame)}
                title={`${col.label}: ${formatNumber(cell.fame)} medals`}
              >
                {formatNumber(cell.fame)}
              </div>
            ) : (
              <div className="text-ink-muted/25 py-1 leading-5">·</div>
            )}
          </td>
        );
      })}
      <Agg value={player.warsPlayed} />
      <Agg value={formatNumber(player.totalFame)} strong />
      <Agg value={formatNumber(player.avgFame)} />
    </tr>
  );
}

function Agg({ value, strong }: { value: string | number; strong?: boolean }) {
  return (
    <td
      className={`group-hover:bg-field-soft border-line border-b px-3 py-1.5 text-right tabular-nums ${strong ? "text-gold font-semibold" : ""}`}
    >
      {value}
    </td>
  );
}

function Legend({ maxFame }: { maxFame: number }) {
  // Red chip for the demote zone, then a blue ramp mirroring the cell heatmap.
  const ramp = [0.15, 0.4, 0.7, 1];
  return (
    <div className="text-onfield-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="rounded px-1.5 py-0.5" style={medalCellStyle(0, maxFame)}>
        Below {formatNumber(MEDAL_DEMOTE)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span>Fewer</span>
        <span className="flex overflow-hidden rounded">
          {ramp.map((r) => (
            <span
              key={r}
              className="size-3.5"
              style={medalCellStyle(
                MEDAL_DEMOTE + r * Math.max(0, maxFame - MEDAL_DEMOTE),
                maxFame,
              )}
            />
          ))}
        </span>
        <span>More medals</span>
      </span>
    </div>
  );
}
