import Link from "next/link";
import { MetricStrip } from "@/components/MetricStrip";
import { RecentLeadsTable } from "@/components/RecentLeadsTable";
import { StatusBadge } from "@/components/StatusBadge";
import type { ManagerDashboard } from "@/lib/view";

/** What a manager's own dashboard shows, for an admin looking at it. */
export function ManagerDashboardView({ data, executiveHref }: { data: ManagerDashboard; executiveHref: (id: string) => string }) {
  const m = data.viewing.user;
  const active = data.executives.filter((e) => e.isActive).length;
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{m.name}</h1>
          <p className="muted">
            Manager · @{m.username}
            {m.isActive ? "" : " · inactive"}
          </p>
        </div>
      </div>
      <MetricStrip
        items={[
          { href: "/admin/leads?status=PENDING_ASSIGNMENT", label: "Need assigning", value: data.summary.pendingLeads, note: data.summary.pendingLeads ? "Waiting for an executive" : "Nothing waiting", alert: data.summary.pendingLeads > 0 },
          { href: "/admin/leads", label: "Leads in scope", value: data.summary.totalLeads, note: "Their executives' leads plus unassigned" },
          { href: `/admin/managers/${m.id}`, label: "Executives", value: data.executives.length, note: `${active} active` },
          { href: "/admin/executives", label: "Manage accounts", value: "Open", note: "Executives list" },
        ]}
      />
      <section aria-labelledby="their-executives" className="grid min-w-0 content-start gap-3">
        <h2 id="their-executives">Their executives</h2>
        {data.executives.length === 0 ? (
          <div className="empty rounded-xl border border-dashed border-border-strong">
            <strong>No executives report to {m.name}</strong>
            Assign executives to this manager from the executive&apos;s page.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {data.executives.map((e) => (
              <li key={e.id}>
                <Link href={executiveHref(e.id)} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{e.name}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">@{e.username}</span>
                  </span>
                  <StatusBadge active={e.isActive} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <RecentLeadsTable
        title="Latest leads in their scope"
        leads={data.recentLeads}
        detailBase="/admin/leads"
        allHref="/admin/leads"
        empty={
          <>
            <strong>No leads yet</strong>
            Leads for this manager&apos;s executives appear here.
          </>
        }
      />
    </>
  );
}
