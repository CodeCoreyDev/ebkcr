// Files/dirs prefixed with `-` are excluded from TanStack Router's route tree,
// so this co-located helper won't become a route.
import { ROLE_RANK } from "@/lib/clash";
import type { ClanMember } from "@/lib/clash";

export type SortKey =
  | "clanRank"
  | "name"
  | "role"
  | "trophies"
  | "donations"
  | "donationsReceived"
  | "lastSeen";

export const TABLE_COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "clanRank", label: "#" },
  { key: "name", label: "Player" },
  { key: "role", label: "Role" },
  { key: "trophies", label: "Trophies", align: "right" },
  { key: "donations", label: "Donated", align: "right" },
  { key: "donationsReceived", label: "Received", align: "right" },
  { key: "lastSeen", label: "Last seen", align: "right" },
];

export function sortMembers(members: ClanMember[], key: SortKey, desc: boolean): ClanMember[] {
  const dir = desc ? -1 : 1;
  return [...members].sort((a, b) => {
    let cmp: number;
    switch (key) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "role":
        cmp = ROLE_RANK[a.role] - ROLE_RANK[b.role];
        break;
      case "lastSeen":
        // lastSeen strings are lexicographically ordered by time (YYYYMMDD...).
        cmp = a.lastSeen.localeCompare(b.lastSeen);
        break;
      default:
        cmp = a[key] - b[key];
    }
    return cmp * dir;
  });
}
