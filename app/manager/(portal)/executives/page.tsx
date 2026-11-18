import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listManagerExecutives } from "@/lib/manager";
import { DESIGNATION_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "My executives" };

export default async function ManagerExecutivesPage() {
  const executives = await listManagerExecutives();

  const Row = ({ e }: { e: (typeof executives)[number] }) => (
    <li>
      <Link href={`/manager/leads?executiveId=${e.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
        <span className="avatar" aria-hidden="true">
          {e.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{e.name}</span>
          <span className="block truncate text-[13px] text-muted-foreground">
            {e.designation ? DESIGNATION_LABEL[e.designation] : "Sales Executive"} · {e.email}
          </span>
        </span>
        <StatusBadge active={e.isActive} />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My executives</h1>
          <p className="muted">Select an executive to see their leads.</p>
        </div>
      </div>

      {executives.length === 0 ? (
        <div className="empty rounded-xl border border-dashed border-border-strong">
          <strong>No executives report to you yet</strong>
          Ask an admin to assign executives to you.
        </div>
      ) : (
        <section aria-label="Your executives" className="grid gap-3">
          <p className="text-[13px] text-muted-foreground">
            {executives.length} {executives.length === 1 ? "executive" : "executives"}
          </p>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">{executives.map((e) => <Row key={e.id} e={e} />)}</ul>
        </section>
      )}
    </>
  );
}
