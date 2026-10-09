import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
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
      followUp: query.followUp || undefined,
      limit: String(PAGE + 1),
      offset: String((query.page - 1) * PAGE),
    }),
    listManagerExecutives(),
  ]);

  return (
    <>
      <AutoRefresh />
      <div className="page-head">
        <div>
          <h1>Leads</h1>
        </div>
        <Link className="btn btn-solid" href="/manager/leads/new">
          <Plus className="size-4" /> Add lead
        </Link>
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
