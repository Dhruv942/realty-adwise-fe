import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LeadsView, parseLeadQuery } from "@/components/leads/LeadsView";
import { AutoRefresh } from "@/components/AutoRefresh";
import { listExecutives, listLeads, listProperties } from "@/lib/admin";

export const metadata: Metadata = { title: "Leads" };

const PAGE = 50;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = parseLeadQuery(await searchParams);
  const [rows, properties, executives] = await Promise.all([
    listLeads({
      search: query.search.trim() || undefined,
      status: query.status || undefined,
      propertyId: query.propertyId || undefined,
      executiveId: query.executiveId || undefined,
      important: query.important || undefined,
      followUp: query.followUp || undefined,
      limit: String(PAGE + 1), // one extra row tells us whether a next page exists
      offset: String((query.page - 1) * PAGE),
    }),
    listProperties(),
    listExecutives(),
  ]);

  return (
    <>
      <AutoRefresh />
      <div className="page-head">
        <div>
          <h1>Leads</h1>
        </div>
        <Link className="btn btn-solid" href="/admin/leads/new">
          <Plus className="size-4" /> Add lead
        </Link>
      </div>
      <LeadsView
        role="ADMIN"
        base="/admin/leads"
        detailBase="/admin/leads"
        leads={rows.slice(0, PAGE)}
        hasNext={rows.length > PAGE}
        query={query}
        properties={properties}
        executives={executives}
      />
    </>
  );
}
