import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { AssignExecutivesForm, EditPropertyForm } from "@/components/PropertyForms";
import { StatusBadge } from "@/components/StatusBadge";
import { setExecutivesAction, setPropertyStatusAction, updatePropertyAction } from "@/lib/actions/properties";
import { getProperty, listAssignmentHistory, listExecutives } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | undefined>> };

async function loadProperty(id: string, filters: { limit?: string; offset?: string } = {}) {
  try {
    return await getProperty(id, filters);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await loadProperty(id)).name };
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const offset = Math.max(0, Number(query.offset) || 0);
  const [property, executives, history] = await Promise.all([
    loadProperty(id, { limit: String(limit), offset: String(offset) }),
    listExecutives({ isActive: "true" }),
    listAssignmentHistory(id, { limit: "10" }).catch(() => []),
  ]);
  const choices = executives.map((e) => ({ id: e.id, name: e.name, username: e.username, managerName: e.manager?.name ?? null }));

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/properties">
            <span aria-hidden="true">←</span> Properties
          </Link>
          <h1>{property.name}</h1>
          <p className="muted">{property.location ?? "No location"}</p>
        </div>
        <StatusBadge active={property.isActive} />
      </div>

      {property.needsAssignment && (
        <p className="notice notice-warn" role="status">
          No executives are picked for this property.
          {property.pendingLeadCount > 0 && (
            <>
              {" "}
              <Link href={`/admin/leads?status=PENDING_ASSIGNMENT&propertyId=${property.id}`}>
                {property.pendingLeadCount} pending lead{property.pendingLeadCount === 1 ? "" : "s"}
              </Link>{" "}
              will be assigned as soon as you save.
            </>
          )}
        </p>
      )}

      <section className="panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2>Inquiries</h2>
            <p className="muted text-sm">Leads received for this property, including current ownership and follow-up status.</p>
          </div>
          <Link className="btn btn-line btn-sm" href={`/admin/leads?propertyId=${property.id}`}>View all leads</Link>
        </div>
        <div className="grid grid-cols-3 gap-2 py-2 sm:gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3"><span className="muted text-xs">Total</span><strong className="num mt-1 block text-xl">{property.inquiryCount ?? 0}</strong></div>
          <div className="rounded-lg border border-border bg-muted/30 p-3"><span className="muted text-xs">Assigned</span><strong className="num mt-1 block text-xl">{property.assignedInquiryCount ?? 0}</strong></div>
          <div className="rounded-lg border border-border bg-muted/30 p-3"><span className="muted text-xs">Pending</span><strong className="num mt-1 block text-xl">{property.pendingInquiryCount ?? 0}</strong></div>
        </div>
        {(property.inquiries ?? []).length === 0 ? <p className="muted py-5 text-sm">No inquiries found for this property.</p> : <div className="table-wrap"><table><thead><tr><th>Lead</th><th>Customer</th><th>Source / type</th><th>Status</th><th>Assigned to</th><th>Follow-up</th></tr></thead><tbody>{(property.inquiries ?? []).map((inquiry) => <tr key={inquiry.id}><td><Link className="person-name" href={`/admin/leads/${inquiry.id}`}>#{inquiry.leadNo}</Link><span className="muted person-sub block">{formatDate(inquiry.createdAt)}</span></td><td>{inquiry.customer.name}<span className="muted person-sub block max-w-48 truncate">{inquiry.message ?? "No message"}</span></td><td>{inquiry.source}<span className="muted person-sub block">{inquiry.enquiryType ?? "—"}</span></td><td><span className="badge badge-info">{inquiry.status}</span></td><td>{inquiry.assignedExecutive ? <>{inquiry.assignedExecutive.name}<span className="muted person-sub block">{inquiry.manager?.name ?? "No manager"}</span></> : <span className="muted">Unassigned</span>}</td><td className="muted">{inquiry.followUpAt ? formatDate(inquiry.followUpAt) : "Not scheduled"}</td></tr>)}</tbody></table></div>}
        {property.inquiryPagination && property.inquiryPagination.total > 0 && <div className="pager mt-4"><span>{property.inquiryPagination.offset + 1}–{Math.min(property.inquiryPagination.offset + property.inquiryPagination.returned, property.inquiryPagination.total)} of {property.inquiryPagination.total}</span><span className="flex gap-2">{offset > 0 && <Link className="btn btn-line btn-sm" href={`/admin/properties/${property.id}?limit=${limit}&offset=${Math.max(0, offset - limit)}`}>Previous</Link>}{offset + limit < property.inquiryPagination.total && <Link className="btn btn-line btn-sm" href={`/admin/properties/${property.id}?limit=${limit}&offset=${offset + limit}`}>Next</Link>}</span></div>}
      </section>

      <div className="cols">
        <div className="side">
          <section className="panel">
            <h2>Executives</h2>
            <p className="muted text-sm">Leads are shared among these executives in rotation, by the order their accounts were created. Inactive executives are skipped.</p>
            <AssignExecutivesForm
              action={setExecutivesAction.bind(null, property.id)}
              choices={choices}
              selected={property.executives.filter((e) => e.isActive).map((e) => e.id)}
              inactiveSelected={property.executives.filter((e) => !e.isActive)}
            />
          </section>

          <section className="panel">
            <h2>Details</h2>
            <EditPropertyForm action={updatePropertyAction.bind(null, property.id)} property={property} />
          </section>
        </div>

        <div className="side">
          <section className="panel">
            <h2>Summary</h2>
            <dl className="meta">
              <dt>Executives</dt>
              <dd>{property.assignedExecutiveCount}</dd>
              <dt>Pending leads</dt>
              <dd>{property.pendingLeadCount}</dd>
              <dt>Leads</dt>
              <dd>
                <Link href={`/admin/leads?propertyId=${property.id}`}>View all</Link>
              </dd>
              <dt>Created</dt>
              <dd>{formatDate(property.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(property.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Recent assignments</h2>
            {history.length === 0 ? (
              <p className="muted">No leads assigned yet.</p>
            ) : (
              <ul className="history">
                {history.map((h) => (
                  <li key={h.id}>
                    <div className="history-head">
                      <Link href={`/admin/leads/${h.leadId}`}>{h.executive.name}</Link>
                      <span className={`badge ${h.method === "ROUND_ROBIN" ? "badge-info" : "badge-warn"}`}>{h.method === "MANUAL" ? "Manual" : h.method === "TIMEOUT" ? "Timed out" : "Rotation"}</span>
                    </div>
                    <div className="muted person-sub">
                      {formatDate(h.createdAt)}
                      {h.assignedBy ? ` · by ${h.assignedBy.name}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <h2>Access</h2>
            <p className="muted">
              {property.isActive ? "Inactive properties reject new leads." : "New leads for this property are rejected until it is activated."}
            </p>
            <ActionForm
              action={setPropertyStatusAction.bind(null, property.id, !property.isActive)}
              label={property.isActive ? "Deactivate" : "Activate"}
              pendingLabel="Updating…"
              variant={property.isActive ? "line" : "solid"}
              confirm={property.isActive ? `Deactivate ${property.name}?` : undefined}
            />
          </section>
        </div>
      </div>
    </>
  );
}
