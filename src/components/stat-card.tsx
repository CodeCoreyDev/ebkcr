import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

/**
 * One arena stat, laid out like a reward tile in the store: gold-rimmed icon
 * puck on top, the number stamped underneath in Clash type.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 px-3 py-4 text-center">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#7a3c00] bg-gradient-to-b from-[#ffd54a] to-[#f5a300] shadow-[inset_0_2px_0_#ffe792,inset_0_-2px_0_#c26a00]">
        <Icon className="size-5.5 text-[#7a3c00]" strokeWidth={2.5} />
      </div>
      <div className="w-full min-w-0">
        <div className="cr-stat w-full truncate text-lg sm:text-xl">{value}</div>
        <div className="text-ink-muted mt-1 text-[11px] font-semibold tracking-wider uppercase">
          {label}
        </div>
        {sub ? <div className="text-ink-muted/70 truncate text-[11px]">{sub}</div> : null}
      </div>
    </Card>
  );
}
