import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useMemo, useState } from "react";

import { RoleBadge } from "@/components/role-badge";
import { Card } from "@/components/ui/card";
import { formatNumber, formatRelativeTime } from "@/lib/clash";
import { useClashData } from "@/lib/clash-data";
import { TABLE_COLUMNS, sortMembers } from "@/routes/-members-table";
import type { SortKey } from "@/routes/-members-table";

export const Route = createFileRoute("/members")({
  component: Members,
});

function RankDelta({ rank, prev }: { rank: number; prev: number }) {
  if (!prev || prev === rank) return <Minus className="text-ink-muted size-3.5" />;
  return prev > rank ? (
    <ArrowUp className="text-victory size-3.5" />
  ) : (
    <ArrowDown className="text-defeat size-3.5" />
  );
}

function Members() {
  const { data } = useClashData();
  const { clan } = data;
  const [sort, setSort] = useState<SortKey>("clanRank");
  const [desc, setDesc] = useState(false);

  const members = useMemo(
    () => sortMembers(clan.memberList, sort, desc),
    [clan.memberList, sort, desc],
  );

  function toggleSort(key: SortKey) {
    if (key === sort) {
      setDesc((d) => !d);
    } else {
      setSort(key);
      // Trophies/donations are most useful highest-first; rank lowest-first.
      setDesc(key !== "clanRank" && key !== "name");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Roster</h1>
        <p className="text-ink-muted text-sm">
          {clan.memberList.length} members · click a column to sort
        </p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="text-ink-muted text-left text-xs tracking-wide uppercase">
            <tr className="border-card-border border-b">
              {TABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`hover:text-ink cursor-pointer px-3 py-3 font-medium select-none ${col.align === "right" ? "text-right" : ""}`}
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  {sort === col.key ? <span className="text-gold"> {desc ? "▾" : "▴"}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.tag} className="border-card-border/50 hover:bg-field-soft/50 border-b">
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-ink-muted w-5 text-right font-mono">{m.clanRank}</span>
                    <RankDelta rank={m.clanRank} prev={m.previousClanRank} />
                  </span>
                </td>
                <td className="px-3 py-2.5 font-medium">{m.name}</td>
                <td className="px-3 py-2.5">
                  <RoleBadge role={m.role} />
                </td>
                <td className="text-gold px-3 py-2.5 text-right font-semibold">
                  {formatNumber(m.trophies)}
                </td>
                <td className="px-3 py-2.5 text-right">{formatNumber(m.donations)}</td>
                <td className="text-ink-muted px-3 py-2.5 text-right">
                  {formatNumber(m.donationsReceived)}
                </td>
                <td className="text-ink-muted px-3 py-2.5 text-right">
                  {formatRelativeTime(m.lastSeen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
