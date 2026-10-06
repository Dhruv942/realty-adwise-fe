import type { Metadata } from "next";
import { MetricStrip } from "@/components/MetricStrip";
import { RecentLeadsTable } from "@/components/RecentLeadsTable";
import { listManagerExecutives, listManagerLeads, listManagerTeams } from "@/lib/manager";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Overview" };

export default async function ManagerOverview() {
  const [{ user }, teams, executives, pending, important, recent] = await Promise.all([
    requireSession("MANAGER"),
    listManagerTeams(),
    listManagerExecutives(),
    listManagerLeads({ status: "PENDING_ASSIGNMENT", limit: "200" }),
    listManagerLeads({ important: "true", limit: "200" }),
    listManagerLeads({ limit: "8" }),
  ]);
  const activeExecutives = executives.filter((e) => e.isActive).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hello, {user.name.split(" ")[0]}</h1>
          <p className="muted">{pending.length ? `${pending.length} ${pending.length === 1 ? "lead is" : "leads are"} waiting for an executive.` : "No leads are waiting for an executive."}</p>
        </div>
      </div>

      <MetricStrip
        items={[
          { href: "/manager/leads?status=PENDING_ASSIGNMENT", label: "Need assigning", value: pending.length, note: pending.length ? "Waiting for an executive" : "Nothing waiting", alert: pending.length > 0 },
          { href: "/manager/leads?important=true", label: "Important", value: important.length, note: "Marked by you" },
          { href: "/manager/team", label: "Active executives", value: activeExecutives, note: "In your teams" },
          { href: "/manager/team", label: "Teams", value: teams.length, note: teams.length === 1 ? "Team you lead" : "Teams you lead" },
        ]}
      />

      <RecentLeadsTable
        title="Latest leads"
        leads={recent}
        detailBase="/manager/leads"
        allHref="/manager/leads"
        empty={
          <>
            <strong>No leads yet</strong>
            Leads for your teams appear here as they arrive.
          </>
        }
      />
    </>
  );
}
