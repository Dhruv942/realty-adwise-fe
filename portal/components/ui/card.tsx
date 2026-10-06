import { cn } from "@/lib/utils";

/** A bordered surface. Use it only when the content is a real group; plain sections don't need one. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-border bg-surface text-card-foreground", className)} {...props} />;
}
