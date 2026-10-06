import type { Metadata } from "next";
import { LeadsView, parseLeadQuery } from "@/components/leads/LeadsView";
import { listManagerExecutives, listManagerLeads } from "@/lib/manager";

export const metadata: Metadata = { title: "Leads" };

const PAGE = 50;

export default async function ManagerLeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = parseLeadQuery(await searchParams);
  const [rows, executives] = await Promise.all([
    listManagerLeads({
      search: query.search.trim() || undefined,
      status: query.status || undefined,
      executiveId: query.executiveId || undefined,
      important: query.important || undefined,
      limit: String(PAGE + 1),
      offset: String((query.page - 1) * PAGE),
    }),
    listManagerExecutives(),
  ]);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Manager</p>
          <h1>Leads</h1>
        </div>
      </div>
      <p className="muted">Your teams&apos; leads, plus leads still waiting for an executive.</p>
      <LeadsView
        role="MANAGER"
        base="/manager/leads"
        detailBase="/manager/leads"
        leads={rows.slice(0, PAGE)}
        hasNext={rows.length > PAGE}
        query={query}
        executives={executives}
      />
    </>
  );
}
