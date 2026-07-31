import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/*
 * Rank plates. Each is a flat tinted pill with a hairline rim — the game's
 * stamped-metal look, dialled well down: these repeat on every row of the roster,
 * so at full chip treatment the tables turn into a bag of sweets. Deliberately
 * NOT in Clash: at 11px the display face closes up and stops being readable.
 *
 * Tints are `currentColor`-derived (`bg-gold/15` over `text-gold-soft`) so each
 * plate re-mixes itself off the theme's own palette — no light/dark variants.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase",
  {
    variants: {
      variant: {
        default: "border-line bg-wash text-ink",
        leader: "border-gold/35 bg-gold/15 text-gold-soft",
        coLeader: "border-arena/35 bg-arena/15 text-arena",
        elder: "border-victory/35 bg-victory/15 text-victory",
        member: "border-line bg-wash text-ink-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
