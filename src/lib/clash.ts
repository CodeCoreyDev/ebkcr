/**
 * Typed access to the statically-imported Clash Royale data.
 *
 * The JSON in `src/data/` is produced by `scripts/fetch-data.ts`. We type it
 * here (a subset of the real API shape — the fields we actually render) and
 * expose small helpers for formatting and derived stats.
 */
import clanData from "@/data/clan.json";
import currentRiverRaceData from "@/data/current-river-race.json";
import metaData from "@/data/meta.json";
import riverRaceLogData from "@/data/river-race-log.json";

export type ClanRole = "leader" | "coLeader" | "elder" | "member";

export interface ClanMember {
  tag: string;
  name: string;
  role: ClanRole;
  lastSeen: string;
  expLevel: number;
  trophies: number;
  arena: { id: number; name: string };
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
}

export interface Clan {
  tag: string;
  name: string;
  type: string;
  description: string;
  badgeId: number;
  clanScore: number;
  clanWarTrophies: number;
  requiredTrophies: number;
  donationsPerWeek: number;
  members: number;
  memberList: ClanMember[];
}

export interface RiverRaceParticipant {
  tag: string;
  name: string;
  fame: number;
  repairPoints: number;
  boatAttacks: number;
  decksUsed: number;
  decksUsedToday: number;
}

export interface RiverRaceClan {
  tag: string;
  name: string;
  badgeId: number;
  fame: number;
  repairPoints: number;
  participants: RiverRaceParticipant[];
  periodPoints: number;
  clanScore: number;
}

export interface CurrentRiverRace {
  state: string;
  clan: RiverRaceClan;
  clans: RiverRaceClan[];
  periodType: string;
  periodIndex: number;
}

export interface RiverRaceLogEntry {
  seasonId: number;
  sectionIndex: number;
  createdDate: string;
  standings: {
    rank: number;
    trophyChange: number;
    clan: RiverRaceClan;
  }[];
}

export interface DataMeta {
  clanTag: string;
  fetchedAt: string | null;
  source: string;
}

/** The full clan dataset, however it was sourced (build-time seed or live). */
export interface ClashData {
  clan: Clan;
  currentRiverRace: CurrentRiverRace | null;
  riverRaceLog: RiverRaceLogEntry[];
  meta: DataMeta;
}

/**
 * Seed dataset baked in at build time by `scripts/fetch-data.ts`. The app
 * renders this instantly on first paint, then the browser refreshes it live
 * (see `src/lib/clash-data.tsx`). It also remains the fallback if a live fetch
 * fails or no token is configured.
 */
export const seedData: ClashData = {
  clan: clanData as unknown as Clan,
  currentRiverRace: currentRiverRaceData as unknown as CurrentRiverRace | null,
  riverRaceLog: (riverRaceLogData as unknown as { items: RiverRaceLogEntry[] }).items,
  meta: metaData as unknown as DataMeta,
};

export const ROLE_LABELS: Record<ClanRole, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  elder: "Elder",
  member: "Member",
};

/** Sort weight so leaders float to the top of role-sorted views. */
export const ROLE_RANK: Record<ClanRole, number> = {
  leader: 0,
  coLeader: 1,
  elder: 2,
  member: 3,
};

const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/**
 * The Clash Royale API encodes timestamps as `20260615T120000.000Z` (no
 * dashes/colons). Normalize to ISO 8601 so `Date` can parse it.
 */
export function parseClashDate(raw: string): Date | null {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(raw);
  if (!m) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
}

export function formatRelativeTime(raw: string): string {
  const date = parseClashDate(raw);
  if (!date) return "unknown";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatFetchedAt(fetchedAt: string | null): string {
  if (!fetchedAt) return "seed data (not yet fetched)";
  const date = new Date(fetchedAt);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface ClanStats {
  memberCount: number;
  totalDonations: number;
  avgTrophies: number;
  topDonator: ClanMember | null;
}

export function computeClanStats(clan: Clan): ClanStats {
  const list = clan.memberList;
  const memberCount = list.length;
  const totalDonations = list.reduce((sum, m) => sum + m.donations, 0);
  const avgTrophies =
    memberCount === 0 ? 0 : Math.round(list.reduce((sum, m) => sum + m.trophies, 0) / memberCount);
  const topDonator =
    memberCount === 0
      ? null
      : list.reduce((top, m) => (m.donations > top.donations ? m : top), list[0]!);
  return { memberCount, totalDonations, avgTrophies, topDonator };
}
