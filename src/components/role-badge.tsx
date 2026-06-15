import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/clash";
import type { ClanRole } from "@/lib/clash";

export function RoleBadge({ role }: { role: ClanRole }) {
  return <Badge variant={role}>{ROLE_LABELS[role]}</Badge>;
}
