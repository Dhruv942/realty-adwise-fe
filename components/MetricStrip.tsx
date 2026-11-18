import Link from "next/link";
import { cn } from "@/lib/utils";

export type Metric = { href: string; label: string; value: string | number; note: string; alert?: boolean };

/** Four key numbers in one divided strip: 2×2 on phones, one row from laptops up. */
export function MetricStrip({ items }: { items: Metric[] }) {
  return (
    <section aria-label="Summary" className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-4">
      {items.map((m) => (
        <Link
          key={m.label}
          href={m.href}
          className={cn(
            "grid content-start gap-1 border-border p-4 transition-colors hover:bg-muted/40 sm:px-5",
            "odd:border-r [&:nth-child(-n+2)]:border-b lg:border-r lg:last:border-r-0 lg:[&:nth-child(-n+2)]:border-b-0",
          )}
        >
          <span className="text-[13px] text-muted-foreground">{m.label}</span>
          <span className={cn("num font-display text-[28px] font-semibold leading-tight tracking-tight", m.alert && "text-destructive")}>{m.value}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {m.alert && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-destructive" />}
            {m.note}
          </span>
        </Link>
      ))}
    </section>
  );
}
