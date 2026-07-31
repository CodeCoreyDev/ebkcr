import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useMemo, useState } from "react";

import { RoleBadge } from "@/components/role-badge";
import { Card } from "@/components/ui/card";
import { TD, TH, THead, TR } from "@/components/ui/table";
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
      <div className="flex flex-col items-start gap-1">
        <h1 className="cr-title text-3xl">Roster</h1>
        <p className="text-onfield-muted text-sm">
          {clan.memberList.length} members · click a column to sort
        </p>
      </div>

      {/* `overflow-hidden` so the header strip and the last row are clipped by
          the panel's 16px corners instead of squaring them off. */}
      <Card className="overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <THead>
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <TH
                    key={col.key}
                    className={`hover:text-gold cursor-pointer whitespace-nowrap select-none ${col.align === "right" ? "text-right" : ""}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sort === col.key ? (
                      <span className="text-gold"> {desc ? "▾" : "▴"}</span>
                    ) : null}
                  </TH>
                ))}
              </tr>
            </THead>
            <tbody>
              {members.map((m) => (
                <TR key={m.tag}>
                  <TD>
                    <span className="flex items-center gap-1.5">
                      <span className="text-ink-muted w-5 text-right tabular-nums">
                        {m.clanRank}
                      </span>
                      <RankDelta rank={m.clanRank} prev={m.previousClanRank} />
                    </span>
                  </TD>
                  <TD className="font-semibold whitespace-nowrap">{m.name}</TD>
                  <TD>
                    <RoleBadge role={m.role} />
                  </TD>
                  <TD className="text-gold text-right font-bold tabular-nums">
                    {formatNumber(m.trophies)}
                  </TD>
                  <TD className="text-right tabular-nums">{formatNumber(m.donations)}</TD>
                  <TD className="text-ink-muted text-right tabular-nums">
                    {formatNumber(m.donationsReceived)}
                  </TD>
                  <TD className="text-ink-muted text-right whitespace-nowrap">
                    {formatRelativeTime(m.lastSeen)}
                  </TD>
                </TR>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
