import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** The navy slab everything sits on; see `.cr-panel` in styles.css. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("cr-panel", className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props} />;
}

/** Stamped gold caption over a card's contents. */
export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("cr-label", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
