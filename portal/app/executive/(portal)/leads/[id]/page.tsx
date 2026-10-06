import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadHistory } from "@/components/LeadHistory";
import { LeadStatusForm } from "@/components/LeadForms";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { updateMyLeadStatusAction } from "@/lib/actions/leads";
import { ApiError } from "@/lib/api";
import { getMyLead } from "@/lib/executive";
import { formatBudget, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  try {
    return await getMyLead(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await load(id)).customer.name };
}

export default async function MyLeadPage({ params }: Props) {
  const { id } = await params;
  const lead = await load(id);

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/executive">
            ← My leads
          </Link>
          <h1>{lead.customer.name}</h1>
          <p className="muted">
            #{lead.leadNo} · {lead.property.name}
          </p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="cols">
        <div className="side">
          <section className="panel">
            <h2>Enquiry</h2>
            <dl className="meta">
              <dt>Mobile</dt>
              <dd>
                <a href={`tel:${lead.customer.mobile}`}>{lead.customer.mobile}</a>
              </dd>
              <dt>Email</dt>
              <dd>{lead.customer.email ?? "—"}</dd>
              <dt>Client type</dt>
              <dd>{lead.customer.type === "COMPANY" ? "Company" : "Individual"}</dd>
              <dt>Property</dt>
              <dd>
                {lead.property.name}
                {lead.property.location ? `, ${lead.property.location}` : ""}
              </dd>
              <dt>Requirement</dt>
              <dd>{lead.requirement ?? "—"}</dd>
              <dt>Budget</dt>
              <dd>{formatBudget(lead.budget)}</dd>
              <dt>Source</dt>
              <dd>{lead.source}</dd>
              <dt>Message</dt>
              <dd>{lead.message ?? "—"}</dd>
              <dt>Assigned</dt>
              <dd>{lead.assignedAt ? formatDate(lead.assignedAt) : "—"}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Client history</h2>
            <LeadHistory history={lead.customerHistory ?? []} count={lead.customerEnquiryCount ?? 1} />
          </section>
        </div>

        <div className="side">
          <section className="panel">
            <h2>Progress</h2>
            <LeadStatusForm action={updateMyLeadStatusAction.bind(null, lead.id)} current={lead.status} />
          </section>
        </div>
      </div>
    </>
  );
}
