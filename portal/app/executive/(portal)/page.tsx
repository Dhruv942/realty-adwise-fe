import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { NewLeadWatcher } from "@/components/NewLeadWatcher";
import { getLeadSummary, listMyLeads } from "@/lib/executive";
import { formatBudget, formatDate, statusLabel } from "@/lib/format";
import { LEAD_STATUSES } from "@/lib/types";

export const metadata: Metadata = { title: "My leads" };

const PAGE = 20;
type SearchParams = Promise<{ status?: string; search?: string; page?: string }>;

export default async function ExecutiveHome({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const tabs = LEAD_STATUSES.filter((s) => s !== "PENDING_ASSIGNMENT");
  const status = (tabs as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [summary, rows] = await Promise.all([
    getLeadSummary(),
    listMyLeads({ status: status || undefined, search: search.trim() || undefined, limit: String(PAGE + 1), offset: String((page - 1) * PAGE) }),
  ]);
  const leads = rows.slice(0, PAGE);
  const hasNext = rows.length > PAGE;
  const href = (n: number) => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (search) q.set("search", search);
    if (n > 1) q.set("page", String(n));
    return `/executive?${q}`;
  };

  return (
    <>
      <NewLeadWatcher newLeads={summary.newLeads} />
      <div className="page-head">
        <div>
          <p className="eyebrow">Executive</p>
          <h1>
            My leads
            {summary.newLeads > 0 && <span className="tag-new">{summary.newLeads} new</span>}
          </h1>
        </div>
        <p className="muted">{summary.totalLeads} total</p>
      </div>

      <div className="chips" role="navigation" aria-label="Status">
        <Link className={`chip${status ? "" : " chip-on"}`} href="/executive">
          All ({summary.totalLeads})
        </Link>
        {tabs.map((s) => (
          <Link key={s} className={`chip${status === s ? " chip-on" : ""}`} href={`/executive?status=${s}`}>
            {statusLabel(s)} ({summary.byStatus[s] ?? 0})
          </Link>
        ))}
      </div>

      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={search} placeholder="Client, mobile or property" />
        </div>
        {status && <input type="hidden" name="status" value={status} />}
        <button className="btn btn-line" type="submit">
          Search
        </button>
      </form>

      <div className="lead-cards">
        {leads.map((l) => (
          <Link key={l.id} prefetch={false} href={`/executive/leads/${l.id}`} className={`lead-card${l.isNew ? " lead-card-new" : ""}`}>
            <div className="lead-card-head">
              <strong>
                {l.customer.name}
                {l.isNew && <span className="tag-new">New</span>}
              </strong>
              <LeadStatusBadge status={l.status} />
            </div>
            <div className="lead-card-meta">
              <span>{l.customer.mobile}</span>
              <span>
                {l.property.name}
                {l.property.location ? `, ${l.property.location}` : ""}
              </span>
              {l.requirement && <span>{l.requirement}</span>}
              {l.budget != null && <span>{formatBudget(l.budget)}</span>}
              <span>{l.source}</span>
            </div>
            <div className="muted person-sub">
              #{l.leadNo}
              {l.assignedAt ? ` · assigned ${formatDate(l.assignedAt)}` : ""}
            </div>
          </Link>
        ))}
        {leads.length === 0 && <p className="empty panel">{search || status ? "No leads match." : "No leads assigned to you yet."}</p>}
      </div>

      {(page > 1 || hasNext) && (
        <div className="pager">
          {page > 1 ? <Link className="btn btn-line btn-sm" href={href(page - 1)}>← Previous</Link> : <span />}
          <span className="muted">Page {page}</span>
          {hasNext ? <Link className="btn btn-line btn-sm" href={href(page + 1)}>Next →</Link> : <span />}
        </div>
      )}
    </>
  );
}
