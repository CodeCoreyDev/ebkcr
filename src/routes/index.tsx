import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Crown, Trophy, Users } from "lucide-react";

import { RoleBadge } from "@/components/role-badge";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clan, computeClanStats, formatNumber } from "@/lib/clash";

export const Route = createFileRoute("/")({
  component: Overview,
});

function Overview() {
  const stats = computeClanStats();
  const topMembers = [...clan.memberList].sort((a, b) => a.clanRank - b.clanRank).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3 text-center">
        <div className="border-gold/30 bg-gold/10 text-gold flex size-20 items-center justify-center rounded-2xl border text-3xl font-black">
          {clan.name.slice(0, 5).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{clan.name}</h1>
          <p className="text-ink-muted font-mono text-sm">{clan.tag}</p>
        </div>
        <p className="text-ink-muted max-w-xl text-sm">{clan.description}</p>
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

      <section>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top Members</CardTitle>
            <Link to="/members" className="text-arena text-xs font-medium hover:underline">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {topMembers.map((m) => (
              <div
                key={m.tag}
                className="hover:bg-field-soft/60 flex items-center justify-between rounded-lg px-2 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-ink-muted w-6 text-right font-mono text-sm">
                    {m.clanRank}
                  </span>
                  <span className="font-medium">{m.name}</span>
                  <RoleBadge role={m.role} />
                </div>
                <span className="text-gold flex items-center gap-1 font-semibold">
                  <Trophy className="size-4" />
                  {formatNumber(m.trophies)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
