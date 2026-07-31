import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "text-gold-soft bg-thead text-left text-[11px] font-bold tracking-wider uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return <th className={cn("px-3 py-2.5 font-bold", className)} {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-line hover:bg-wash border-b transition-colors", className)}
      {...props}
    />
  );
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-3 py-2.5 align-middle", className)} {...props} />;
}
