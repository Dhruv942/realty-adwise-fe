import { MetricStrip } from "@/components/MetricStrip";
import { RecentLeadsTable } from "@/components/RecentLeadsTable";
import { DESIGNATION_LABEL } from "@/lib/types";
import type { ExecutiveDashboard } from "@/lib/view";

/** What an executive's own dashboard shows, for someone allowed to look. `leadsBase` is the viewer's own lead pages. */
export function ExecutiveDashboardView({ data, leadsBase }: { data: ExecutiveDashboard; leadsBase: string }) {
  const e = data.viewing.user;
  const by = data.summary.byStatus;
  const mine = `${leadsBase}?executiveId=${e.id}`;
  const open = (by.INCOMING ?? 0) + (by.RINGING ?? 0) + (by.CONNECTED ?? 0);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{e.name}</h1>
          <p className="muted">
            {e.designation ? DESIGNATION_LABEL[e.designation] : "Sales Executive"} · @{e.username}
            {e.manager ? ` · reports to ${e.manager.name}` : " · no manager"}
            {e.isActive ? "" : " · inactive"}
          </p>
        </div>
      </div>
      <MetricStrip
        items={[
          { href: mine, label: "New leads", value: data.summary.newLeads, note: "Not opened yet", alert: data.summary.newLeads > 0 },
          { href: mine, label: "Total leads", value: data.summary.totalLeads, note: "Assigned to them" },
          { href: `${mine}&status=INCOMING`, label: "Incoming", value: by.INCOMING ?? 0, note: "Waiting for first contact" },
          { href: mine, label: "In progress", value: open, note: "Incoming, ringing or connected" },
        ]}
      />
      <RecentLeadsTable
        title="Latest leads"
        leads={data.recentLeads}
        detailBase={leadsBase}
        allHref={mine}
        empty={
          <>
            <strong>No leads yet</strong>
            Nothing is assigned to {e.name} right now.
          </>
        }
      />
    </>
  );
}
