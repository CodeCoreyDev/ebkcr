import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

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
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="bg-gold/10 text-gold flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-ink-muted text-xs font-medium tracking-wide uppercase">{label}</div>
          <div className="text-ink truncate text-xl font-bold">{value}</div>
          {sub ? <div className="text-ink-muted truncate text-xs">{sub}</div> : null}
        </div>
      </div>
    </Card>
  );
}
