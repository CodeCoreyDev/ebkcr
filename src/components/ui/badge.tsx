import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-card-border/60 text-ink",
        leader: "bg-gold/20 text-gold-soft ring-1 ring-gold/40",
        coLeader: "bg-arena/20 text-arena ring-1 ring-arena/40",
        elder: "bg-victory/15 text-victory ring-1 ring-victory/30",
        member: "bg-card-border/50 text-ink-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
