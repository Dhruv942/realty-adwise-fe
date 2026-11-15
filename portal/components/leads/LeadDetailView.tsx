import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Phone } from "lucide-react";
import Link from "next/link";
import { LeadHistory } from "@/components/LeadHistory";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { LeadStatusForm } from "@/components/LeadForms";
import { ActivityTimeline } from "@/components/leads/ActivityTimeline";
import { SlaClock } from "@/components/SlaClock";
import { formatBudget, formatDate, whatsappUrl } from "@/lib/format";
import { ENQUIRY_LABEL, sourceLabel, type FormState, type LeadDetail, type Role } from "@/lib/types";
import { AssignForm } from "./AssignForm";
import { FollowUpPanel } from "./FollowUpPanel";
import { ImportantButton } from "./ImportantButton";
import { LeadOwnershipActions } from "./LeadOwnershipActions";
import { LeadWhatsAppActions } from "./LeadWhatsAppActions";

type Props = {
  lead: LeadDetail;
  role: Role;
  backHref: string;
  backLabel: string;
  /** Present when this role can change status. */
  statusAction?: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** Present when this role can assign or reassign. */
  assign?: { action: (prev: FormState, formData: FormData) => Promise<FormState>; executives: { id: string; name: string; designation?: string }[] };
  ownership?: { transferAction: (prev: FormState, formData: FormData) => Promise<FormState>; splitAction: (prev: FormState, formData: FormData) => Promise<FormState>; executives: { id: string; name: string; designation?: string }[] };
  /** Admin only: where to send the user when the lead has no executive. */
  propertyHref?: string;
  created?: boolean;
  whatsappMessage?: string;
};

export function LeadDetailView({ lead, role, backHref, backLabel, statusAction, assign, ownership, propertyHref, created, whatsappMessage }: Props) {
  const pending = lead.status === "PENDING_ASSIGNMENT";
  const phone = lead.customer.mobile;

  return (
    <>
      <div className="page-head">
        <div className="min-w-0">
          <Link className="back" href={backHref}>
            <span aria-hidden="true">←</span> {backLabel}
          </Link>
          <h1 className="truncate">{lead.customer.name}</h1>
          <p className="muted mt-1">
            #{lead.leadNo} · {lead.requestedPropertyName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ImportantButton role={role} id={lead.id} initial={lead.isImportant} />
          <LeadStatusBadge status={lead.status} />
          {ownership && <LeadOwnershipActions lead={lead} executives={ownership.executives} transferAction={ownership.transferAction} splitAction={ownership.splitAction} />}
        </div>
      </div>

      {/* Contact actions: inline on tablet and up, a fixed bar above the bottom navigation on phones */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-border bg-surface p-2.5 sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 sm:mx-0 sm:flex">
          <a href={`tel:${phone}`} className="btn btn-solid min-h-11 no-underline sm:min-h-10">
            <Phone aria-hidden="true" /> Call<span className="hidden sm:inline"> {phone}</span>
          </a>
          <a href={whatsappUrl(phone)} target="_blank" rel="noopener noreferrer" className="btn btn-line min-h-11 no-underline sm:min-h-10" aria-label={`WhatsApp ${lead.customer.name} (opens in a new tab)`}>
            <WhatsAppIcon aria-hidden="true" /> WhatsApp
          </a>
        </div>
      </div>

      <SlaClock sla={lead.sla} role={role} executiveName={lead.assignedExecutive?.name} />

      {whatsappMessage && (role === "ADMIN" || role === "MANAGER") && <LeadWhatsAppActions message={whatsappMessage} />}

      {created && !pending && (
        <p className="notice notice-success" role="status">
          Lead saved and assigned to {lead.assignedExecutive?.name ?? "an executive"}.
        </p>
      )}
      {pending && (
        <p className="notice notice-warn" role="status">
          No executive is assigned to {lead.property.name} yet.
          {assign ? " Choose one under “Assigned to”." : " An admin or manager needs to assign it."}
          {propertyHref && (
            <>
              {" "}
              To share this property&apos;s leads automatically, <Link href={propertyHref}>pick its executives</Link>.
            </>
          )}
        </p>
      )}

      <div className="cols">
        <div className="side">
          <section className="panel">
            <h2>Enquiry</h2>
            <dl className="meta">
              <dt>Mobile</dt>
              <dd>
                <a href={`tel:${phone}`}>{phone}</a>
              </dd>
              <dt>Email</dt>
              <dd>{lead.customer.email ?? "—"}</dd>
              <dt>Looking to</dt>
              <dd>{lead.enquiryType ? ENQUIRY_LABEL[lead.enquiryType] : "—"}</dd>
              <dt>Property</dt>
              <dd>
                {role === "ADMIN" ? <Link href={`/admin/properties/${lead.property.id}`}>{lead.property.name}</Link> : lead.property.name}
                {lead.property.location ? `, ${lead.property.location}` : ""}
              </dd>
              <dt>Requirement</dt>
              <dd>{lead.requirement ?? "—"}</dd>
              <dt>Budget</dt>
              <dd>{formatBudget(lead.budget)}</dd>
              <dt>Source</dt>
              <dd>{sourceLabel(lead.source)}</dd>
              {lead.externalLeadId && (
                <>
                  <dt>External lead ID</dt>
                  <dd>{lead.externalLeadId}</dd>
                </>
              )}
              <dt>Message</dt>
              <dd>{lead.message ?? "—"}</dd>
              <dt>Assigned</dt>
              <dd>{lead.assignedAt ? formatDate(lead.assignedAt) : "—"}</dd>
              <dt>Received</dt>
              <dd>{formatDate(lead.createdAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Activity Timeline</h2>
            <ActivityTimeline activity={lead.activity ?? []} />
          </section>

          <section className="panel">
            <h2>Previous enquiries</h2>
            <LeadHistory history={lead.customerHistory ?? []} count={lead.customerEnquiryCount ?? 1} />
          </section>
        </div>

        <div className="side">
          <FollowUpPanel role={role} leadId={lead.id} initial={lead.followUp} />

          {statusAction && (
            <section className="panel">
              <h2>Status</h2>
              {pending ? (
                <p className="muted">Status can be changed once an executive is assigned.</p>
              ) : (
                <LeadStatusForm action={statusAction} current={lead.status} />
              )}
            </section>
          )}

          {(assign || role === "ADMIN" || role === "MANAGER") && (
            <section className="panel">
              <h2>Assigned to</h2>
              <p>{lead.assignedExecutive ? lead.assignedExecutive.name : <span className="muted">Nobody yet</span>}</p>
              {assign && (
                <AssignForm
                  action={assign.action}
                  executives={assign.executives}
                  currentId={lead.assignedExecutive?.id}
                  label={lead.assignedExecutive ? "Reassign" : "Assign"}
                />
              )}
            </section>
          )}
        </div>
      </div>

    </>
  );
}
