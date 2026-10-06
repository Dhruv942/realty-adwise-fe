import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadHistory } from "@/components/LeadHistory";
import { LeadStatusForm } from "@/components/LeadForms";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { updateLeadStatusAction } from "@/lib/actions/leads";
import { getLead } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { formatBudget, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

async function loadLead(id: string) {
  try {
    return await getLead(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await loadLead(id)).customer.name };
}

export default async function LeadPage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const lead = await loadLead(id);
  const pending = lead.status === "PENDING_ASSIGNMENT";

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/leads">
            ← Leads
          </Link>
          <h1>{lead.customer.name}</h1>
          <p className="muted">
            #{lead.leadNo} · {lead.requestedPropertyName}
          </p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      {created && !pending && (
        <p className="notice notice-success" role="status">
          Lead saved and assigned to {lead.assignedExecutive?.name ?? "an executive"}.
        </p>
      )}
      {pending && (
        <p className="notice notice-error" role="status">
          No executive is assigned to {lead.property.name}. Please{" "}
          <Link href={`/admin/properties/${lead.property.id}`}>assign executives to the property</Link>; this lead will
          be assigned automatically.
        </p>
      )}

      <div className="cols">
        <div className="side">
          <section className="panel">
            <h2>Lead</h2>
            <dl className="meta">
              <dt>Client</dt>
              <dd>
                <Link href={`/admin/customers/${lead.customer.id}`}>{lead.customer.name}</Link>
                {lead.customer.type === "COMPANY" ? " (Company)" : ""}
              </dd>
              <dt>Mobile</dt>
              <dd>{lead.customer.mobile}</dd>
              <dt>Email</dt>
              <dd>{lead.customer.email ?? "—"}</dd>
              <dt>Property</dt>
              <dd>
                <Link href={`/admin/properties/${lead.property.id}`}>{lead.property.name}</Link>
              </dd>
              <dt>Source</dt>
              <dd>{lead.source}</dd>
              <dt>Requirement</dt>
              <dd>{lead.requirement ?? "—"}</dd>
              <dt>Budget</dt>
              <dd>{formatBudget(lead.budget)}</dd>
              <dt>External ID</dt>
              <dd>{lead.externalLeadId ?? "—"}</dd>
              <dt>Message</dt>
              <dd>{lead.message ?? "—"}</dd>
              <dt>Received</dt>
              <dd>{formatDate(lead.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(lead.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Client history</h2>
            <LeadHistory history={lead.customerHistory ?? []} count={lead.customerEnquiryCount ?? 1} />
          </section>
        </div>

        <div className="side">
          <section className="panel">
            <h2>Assigned to</h2>
            <p>{lead.assignedExecutive ? lead.assignedExecutive.name : <span className="muted">Nobody yet</span>}</p>
          </section>

          <section className="panel">
            <h2>Progress</h2>
            {pending ? (
              <p className="muted">Status can be changed once an executive is assigned.</p>
            ) : (
              <LeadStatusForm action={updateLeadStatusAction.bind(null, lead.id)} current={lead.status} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
