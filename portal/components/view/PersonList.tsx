import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";

export type Person = { id: string; name: string; username: string; isActive: boolean; sub?: string };

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

export function PersonList({ people, href, empty }: { people: Person[]; href: (id: string) => string; empty: React.ReactNode }) {
  if (people.length === 0) return <div className="empty rounded-xl border border-dashed border-border-strong">{empty}</div>;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
      {people.map((p) => (
        <li key={p.id}>
          <Link href={href(p.id)} className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
            <span className="avatar" aria-hidden="true">{initials(p.name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{p.name}</span>
              <span className="block truncate text-[13px] text-muted-foreground">@{p.username}{p.sub ? ` · ${p.sub}` : ""}</span>
            </span>
            <StatusBadge active={p.isActive} />
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
