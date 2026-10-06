import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { LeadHistory } from "@/components/LeadHistory";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { LeadStatusForm } from "@/components/LeadForms";
import { formatBudget, formatDate, slaDeadline, whatsappUrl } from "@/lib/format";
import type { FormState, LeadDetail, Role } from "@/lib/types";
import { AssignForm } from "./AssignForm";
import { ImportantButton } from "./ImportantButton";

type Props = {
  lead: LeadDetail;
  role: Role;
  backHref: string;
  backLabel: string;
  /** Present when this role can change status. */
  statusAction?: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** Present when this role can assign or reassign. */
  assign?: { action: (prev: FormState, formData: FormData) => Promise<FormState>; executives: { id: string; name: string; designation?: string }[] };
  /** Admin only: where to send the user when the lead has no executive. */
  propertyHref?: string;
  created?: boolean;
};

export function LeadDetailView({ lead, role, backHref, backLabel, statusAction, assign, propertyHref, created }: Props) {
  const pending = lead.status === "PENDING_ASSIGNMENT";
  const phone = lead.customer.mobile;

  return (
    <>
      <div className="page-head">
        <div className="min-w-0">
          <Link className="back" href={backHref}>
            ← {backLabel}
          </Link>
          <h1 className="truncate">{lead.customer.name}</h1>
          <p className="muted">
            #{lead.leadNo} · {lead.requestedPropertyName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportantButton role={role} id={lead.id} initial={lead.isImportant} />
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>

      {role === "EXECUTIVE" && slaDeadline(lead.status, lead.assignedAt) && (
        <p className="notice notice-error" role="status">
          Update the status by {slaDeadline(lead.status, lead.assignedAt)}, or this lead moves to the next executive. Opening it isn&apos;t enough.
        </p>
      )}

      {created && !pending && (
        <p className="notice notice-success" role="status">
          Lead saved and assigned to {lead.assignedExecutive?.name ?? "an executive"}.
        </p>
      )}
      {pending && (
        <p className="notice notice-error" role="status">
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
              <dt>Client type</dt>
              <dd>{lead.customer.type === "COMPANY" ? "Company" : "Individual"}</dd>
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
              <dd>{lead.source}</dd>
              <dt>Message</dt>
              <dd>{lead.message ?? "—"}</dd>
              <dt>External ID</dt>
              <dd>{lead.externalLeadId ?? "—"}</dd>
              <dt>Assigned</dt>
              <dd>{lead.assignedAt ? formatDate(lead.assignedAt) : "—"}</dd>
              <dt>Received</dt>
              <dd>{formatDate(lead.createdAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Previous enquiries</h2>
            <LeadHistory history={lead.customerHistory ?? []} count={lead.customerEnquiryCount ?? 1} />
          </section>
        </div>

        <div className="side">
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

      {/* Sticky contact bar, sits above the bottom navigation on phones */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-border bg-card/95 p-2.5 backdrop-blur sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 sm:max-w-md">
          <a href={`tel:${phone}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-foreground font-display text-xs uppercase tracking-[.18em] no-underline hover:bg-foreground hover:text-white">
            <Phone className="size-4" /> Call
          </a>
          <a href={whatsappUrl(phone)} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#128c4a] font-display text-xs uppercase tracking-[.18em] text-white no-underline hover:bg-[#0e7a3f]">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
