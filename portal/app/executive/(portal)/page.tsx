import type { Metadata } from "next";
import { LeadsView, parseLeadQuery } from "@/components/leads/LeadsView";
import { AutoRefresh } from "@/components/AutoRefresh";
import { getLeadSummary, listMyLeads } from "@/lib/executive";
import { LEAD_STATUSES } from "@/lib/types";

export const metadata: Metadata = { title: "My leads" };

const PAGE = 20;
const STATUSES = LEAD_STATUSES.filter((s) => s !== "PENDING_ASSIGNMENT");

export default async function ExecutiveHome({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = parseLeadQuery(await searchParams, STATUSES);
  const [summary, rows] = await Promise.all([
    getLeadSummary(),
    listMyLeads({
      status: query.status || undefined,
      search: query.search.trim() || undefined,
      important: query.important || undefined,
      followUp: query.followUp || undefined,
      limit: String(PAGE + 1),
      offset: String((query.page - 1) * PAGE),
    }),
  ]);

  return (
    <>
      <AutoRefresh />
      <div className="page-head">
        <div>
          <h1>
            My leads
            {summary.newLeads > 0 && <span className="tag-new">{summary.newLeads} new</span>}
          </h1>
        </div>
        <p className="muted">{summary.totalLeads} total</p>
      </div>
      <LeadsView
        role="EXECUTIVE"
        base="/executive"
        detailBase="/executive/leads"
        leads={rows.slice(0, PAGE)}
        hasNext={rows.length > PAGE}
        query={query}
        statuses={STATUSES}
        statusCounts={summary.byStatus}
        showExecutive={false}
      />
    </>
  );
}
