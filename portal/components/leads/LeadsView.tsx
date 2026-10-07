import Link from "next/link";
import { statusLabel } from "@/lib/format";
import { LEAD_STATUSES, type Lead, type Role } from "@/lib/types";
import { LeadCard } from "./LeadCard";

export type LeadQuery = { search: string; status: string; propertyId: string; executiveId: string; important: string; page: number };

type Option = { id: string; name: string };

type Props = {
  role: Role;
  base: string; // e.g. /manager/leads
  detailBase: string; // e.g. /manager/leads
  leads: Lead[];
  hasNext: boolean;
  query: LeadQuery;
  properties?: Option[];
  executives?: Option[];
  /** Statuses offered in the filter (executives never see "Pending"). */
  statuses?: readonly string[];
  statusCounts?: Partial<Record<string, number>>;
  showExecutive?: boolean;
  /** Response time in minutes, when the viewer can read the setting (admin). */
  slaMinutes?: number;
};

export function parseLeadQuery(sp: Record<string, string | undefined>, statuses: readonly string[] = LEAD_STATUSES): LeadQuery {
  return {
    search: sp.search ?? "",
    status: statuses.includes(sp.status ?? "") ? sp.status! : "",
    propertyId: sp.propertyId ?? "",
    executiveId: sp.executiveId ?? "",
    important: sp.important === "true" ? "true" : "",
    page: Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1),
  };
}

export function LeadsView({ role, base, detailBase, leads, hasNext, query, properties, executives, statuses = LEAD_STATUSES, statusCounts, showExecutive = true, slaMinutes }: Props) {
  const filtered = Boolean(query.search || query.status || query.propertyId || query.executiveId || query.important);
  const href = (n: number) => {
    const q = new URLSearchParams();
    if (query.search) q.set("search", query.search);
    if (query.status) q.set("status", query.status);
    if (query.propertyId) q.set("propertyId", query.propertyId);
    if (query.executiveId) q.set("executiveId", query.executiveId);
    if (query.important) q.set("important", "true");
    if (n > 1) q.set("page", String(n));
    return `${base}?${q}`;
  };

  return (
    <>
      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={query.search} placeholder="Client, mobile, email or property" />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={query.status}>
            <option value="">All statuses{statusCounts ? ` (${Object.values(statusCounts).reduce<number>((a, b) => a + (b ?? 0), 0)})` : ""}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
                {statusCounts ? ` (${statusCounts[s] ?? 0})` : ""}
              </option>
            ))}
          </select>
        </div>
        {properties && (
          <div className="field">
            <label htmlFor="property">Property</label>
            <select id="property" name="propertyId" defaultValue={query.propertyId}>
              <option value="">All properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {executives && (
          <div className="field">
            <label htmlFor="exec">Executive</label>
            <select id="exec" name="executiveId" defaultValue={query.executiveId}>
              <option value="">All executives</option>
              {executives.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="important">Show</label>
          <select id="important" name="important" defaultValue={query.important}>
            <option value="">All leads</option>
            <option value="true">Important only</option>
          </select>
        </div>
        <button className="btn btn-line" type="submit">
          Apply
        </button>
        {filtered && (
          <Link className="btn btn-line" href={base}>
            Clear
          </Link>
        )}
      </form>

      {leads.length === 0 ? (
        <div className="empty rounded-xl border border-dashed border-border-strong">
          {filtered ? (
            <>
              <strong>No leads match these filters</strong>
              Try a different search or status, or <Link href={base}>clear the filters</Link>.
            </>
          ) : (
            <>
              <strong>No leads yet</strong>
              New enquiries appear here as soon as they arrive.
            </>
          )}
        </div>
      ) : (
        <section aria-label="Leads">
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {leads.map((l) => (
              <li key={l.id}>
                <LeadCard lead={l} role={role} href={`${detailBase}/${l.id}`} showExecutive={showExecutive} slaMinutes={slaMinutes} />
              </li>
            ))}
          </ul>
          <p className="hint mt-2 sm:hidden">Tip: press and hold a lead to mark it important.</p>
        </section>
      )}

      {(query.page > 1 || hasNext) && (
        <nav className="pager" aria-label="Pagination">
          {query.page > 1 ? (
            <Link className="btn btn-line btn-sm" href={href(query.page - 1)}>
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="muted">Page {query.page}</span>
          {hasNext ? (
            <Link className="btn btn-line btn-sm" href={href(query.page + 1)}>
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
