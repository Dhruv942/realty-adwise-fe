import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { listExecutives, listLeads, listProperties } from "@/lib/admin";
import { formatBudget, formatDate, statusLabel } from "@/lib/format";
import { LEAD_STATUSES } from "@/lib/types";

export const metadata: Metadata = { title: "Leads" };

const PAGE = 50;
type SearchParams = Promise<{ search?: string; status?: string; propertyId?: string; executiveId?: string; page?: string }>;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const status = (LEAD_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const propertyId = sp.propertyId ?? "";
  const executiveId = sp.executiveId ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  // Fetch one extra row to know whether a next page exists.
  const [rows, properties, executives] = await Promise.all([
    listLeads({
      search: search.trim() || undefined,
      status: status || undefined,
      propertyId: propertyId || undefined,
      executiveId: executiveId || undefined,
      limit: String(PAGE + 1),
      offset: String((page - 1) * PAGE),
    }),
    listProperties(),
    listExecutives(),
  ]);
  const leads = rows.slice(0, PAGE);
  const hasNext = rows.length > PAGE;
  const filtered = Boolean(search || status || propertyId || executiveId);

  const pageHref = (n: number) => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (status) q.set("status", status);
    if (propertyId) q.set("propertyId", propertyId);
    if (executiveId) q.set("executiveId", executiveId);
    if (n > 1) q.set("page", String(n));
    return `/admin/leads?${q}`;
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Leads</h1>
        </div>
        <Link className="btn btn-solid" href="/admin/leads/new">
          + Add lead
        </Link>
      </div>

      <div className="chips" role="navigation" aria-label="Status">
        <Link className={`chip${status ? "" : " chip-on"}`} href="/admin/leads">
          All
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link key={s} className={`chip${status === s ? " chip-on" : ""}`} href={`/admin/leads?status=${s}`}>
            {statusLabel(s)}
          </Link>
        ))}
      </div>

      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={search} placeholder="Customer, mobile, email or property" />
        </div>
        <div className="field">
          <label htmlFor="property">Property</label>
          <select id="property" name="propertyId" defaultValue={propertyId}>
            <option value="">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="exec">Executive</label>
          <select id="exec" name="executiveId" defaultValue={executiveId}>
            <option value="">All executives</option>
            {executives.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        {status && <input type="hidden" name="status" value={status} />}
        <button className="btn btn-line" type="submit">
          Filter
        </button>
        {filtered && (
          <Link className="btn btn-line" href="/admin/leads">
            Clear
          </Link>
        )}
      </form>

      <div className="table-wrap table-exec">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Property</th>
              <th>Requirement</th>
              <th>Source</th>
              <th>Budget</th>
              <th>Executive</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link className="person-name" href={`/admin/leads/${l.id}`}>
                    {l.customer.name}
                  </Link>
                  <div className="muted person-sub">
                    #{l.leadNo} · {l.customer.mobile}
                  </div>
                </td>
                <td>
                  <Link href={`/admin/properties/${l.property.id}`}>{l.property.name}</Link>
                </td>
                <td>{l.requirement ?? <span className="muted">—</span>}</td>
                <td>{l.source}</td>
                <td>{formatBudget(l.budget)}</td>
                <td>{l.assignedExecutive?.name ?? <span className="muted">Unassigned</span>}</td>
                <td>
                  <LeadStatusBadge status={l.status} />
                </td>
                <td className="muted">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  {filtered ? "No leads match these filters." : "No leads yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(page > 1 || hasNext) && (
        <div className="pager">
          {page > 1 ? (
            <Link className="btn btn-line btn-sm" href={pageHref(page - 1)}>
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="muted">Page {page}</span>
          {hasNext ? (
            <Link className="btn btn-line btn-sm" href={pageHref(page + 1)}>
              Older →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}
