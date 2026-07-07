// Files/dirs prefixed with `-` are excluded from TanStack Router's route tree,
// so this co-located helper won't become a route. It reshapes the flat
// river-race log into a per-player × per-war grid for the participation heatmap.
import { parseClashDate } from "@/lib/clash";
import type { Clan, ClanRole, RiverRaceLogEntry } from "@/lib/clash";

/** A clan war supplies up to 4 decks per day across 4 battle days. */
export const MAX_DECKS_PER_WAR = 16;

/** One past war — a column in the heatmap. */
export interface WarColumn {
  key: string;
  seasonId: number;
  sectionIndex: number;
  date: Date | null;
  label: string;
  /** Where our clan finished that week (1 = won the race). */
  rank: number;
}

export interface WarCell {
  decksUsed: number;
  fame: number;
}

/** One player — a row in the heatmap, aggregated across all wars. */
export interface PlayerRow {
  tag: string;
  name: string;
  role: ClanRole | null;
  isCurrentMember: boolean;
  /** Raw Clash "last seen" timestamp for current members; `null` if they've left. */
  lastSeen: string | null;
  /** Aligned to `columns`; `null` where the player wasn't in that war. */
  cells: (WarCell | null)[];
  totalFame: number;
  totalDecks: number;
  /** Wars where the player used at least one deck. */
  warsPlayed: number;
  avgFame: number;
  avgDecks: number;
}

export interface WarHistory {
  columns: WarColumn[];
  players: PlayerRow[];
  /** Largest single-war fame in the data — used to scale the medals heatmap. */
  maxCellFame: number;
}

/** Which metric the heatmap cells (and per-week column sorts) show. */
export type WarMode = "decks" | "medals";

/**
 * Aggregate-column sort keys, or `col:N` to sort by a single war week (column
 * index N in the displayed order). A per-week sort uses whichever metric the
 * current `WarMode` is showing.
 */
export type WarSortKey =
  | "name"
  | "warsPlayed"
  | "totalDecks"
  | "avgDecks"
  | "totalFame"
  | "avgFame"
  | `col:${number}`;

/** The numeric value a cell contributes under the given mode. */
function cellValue(cell: WarCell | null, mode: WarMode): number {
  // Missing weeks sink below any played week (incl. a zero-fame/zero-deck one).
  if (!cell) return -1;
  return mode === "decks" ? cell.decksUsed : cell.fame;
}

/** Build the player × war grid from the river-race log. */
export function buildWarHistory(clan: Clan, riverRaceLog: RiverRaceLogEntry[]): WarHistory {
  // Oldest war on the left, newest on the right — a natural timeline.
  const entries = [...riverRaceLog].sort((a, b) =>
    a.seasonId !== b.seasonId ? a.seasonId - b.seasonId : a.sectionIndex - b.sectionIndex,
  );

  const columns: WarColumn[] = entries.map((e) => {
    const ours = e.standings.find((s) => s.clan.tag === clan.tag);
    const date = parseClashDate(e.createdDate);
    return {
      key: `${e.seasonId}-${e.sectionIndex}`,
      seasonId: e.seasonId,
      sectionIndex: e.sectionIndex,
      date,
      label: date
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `S${e.seasonId} W${e.sectionIndex + 1}`,
      rank: ours?.rank ?? 0,
    };
  });

  const memberByTag = new Map(clan.memberList.map((m) => [m.tag, m]));
  const rows = new Map<string, PlayerRow>();
  let maxCellFame = 0;

  entries.forEach((e, colIdx) => {
    const ours = e.standings.find((s) => s.clan.tag === clan.tag);
    if (!ours) return;
    for (const p of ours.clan.participants) {
      let row = rows.get(p.tag);
      if (!row) {
        const member = memberByTag.get(p.tag);
        row = {
          tag: p.tag,
          name: p.name,
          role: member?.role ?? null,
          isCurrentMember: Boolean(member),
          lastSeen: member?.lastSeen ?? null,
          cells: Array.from({ length: columns.length }, () => null),
          totalFame: 0,
          totalDecks: 0,
          warsPlayed: 0,
          avgFame: 0,
          avgDecks: 0,
        };
        rows.set(p.tag, row);
      }
      // Prefer the current roster name; otherwise the latest name seen (we
      // iterate oldest→newest, so a later war overwrites with a fresher name).
      const member = memberByTag.get(p.tag);
      row.name = member?.name ?? p.name;
      if (p.decksUsed > 0 || p.fame > 0) {
        row.cells[colIdx] = { decksUsed: p.decksUsed, fame: p.fame };
        row.totalFame += p.fame;
        row.totalDecks += p.decksUsed;
        row.warsPlayed += 1;
        if (p.fame > maxCellFame) maxCellFame = p.fame;
      }
    }
  });

  const players = [...rows.values()].filter((r) => r.warsPlayed > 0);
  for (const r of players) {
    r.avgFame = Math.round(r.totalFame / r.warsPlayed);
    r.avgDecks = r.totalDecks / r.warsPlayed;
  }

  // Built oldest→newest (so the name-resolution above keeps the freshest name);
  // flip both columns and the aligned cells so the newest war shows on the left.
  columns.reverse();
  for (const r of players) r.cells.reverse();

  return { columns, players, maxCellFame };
}

export function sortPlayers(
  players: PlayerRow[],
  key: WarSortKey,
  desc: boolean,
  mode: WarMode,
): PlayerRow[] {
  const dir = desc ? -1 : 1;
  return [...players].sort((a, b) => {
    let cmp: number;
    if (key === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (key.startsWith("col:")) {
      const idx = Number(key.slice(4));
      cmp = cellValue(a.cells[idx] ?? null, mode) - cellValue(b.cells[idx] ?? null, mode);
    } else {
      // Remaining keys are the numeric aggregate columns.
      const k = key as "warsPlayed" | "totalDecks" | "avgDecks" | "totalFame" | "avgFame";
      cmp = a[k] - b[k];
    }
    // Stable tiebreak by name so equal rows don't shuffle between renders.
    return (cmp || a.name.localeCompare(b.name)) * dir;
  });
}
