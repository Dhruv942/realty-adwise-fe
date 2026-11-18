"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRightLeft, GitFork, Loader2, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormMessage } from "@/components/FormMessage";
import { idleState, type FormState, type Lead, type LeadDetail } from "@/lib/types";

type Operation = "transfer" | "split";
type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function LeadOwnershipActions({ lead, executives, transferAction, splitAction }: {
  lead: Lead | LeadDetail;
  executives: { id: string; name: string; designation?: string }[];
  transferAction: Action;
  splitAction: Action;
}) {
  const eligible = executives.filter((e) => e.id !== lead.assignedExecutive?.id);
  if (!eligible.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <OwnershipDialog operation="transfer" lead={lead} executives={eligible} action={transferAction} />
      <OwnershipDialog operation="split" lead={lead} executives={eligible} action={splitAction} />
    </div>
  );
}

function OwnershipDialog({ operation, lead, executives, action }: { operation: Operation; lead: Lead | LeadDetail; executives: { id: string; name: string; designation?: string }[]; action: Action }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, idleState);
  const router = useRouter();
  const transfer = operation === "transfer";

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="btn btn-line btn-sm">
          {transfer ? <ArrowRightLeft aria-hidden="true" /> : <GitFork aria-hidden="true" />}
          {transfer ? "Transfer lead" : "Split enquiry"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="dialog fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[90vh] max-w-lg -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface-elevated p-5 shadow-lg outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-base font-semibold">{transfer ? "Transfer lead" : "Split enquiry"}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {transfer ? "Move this lead's ownership to another executive." : "Move this enquiry only; the shared customer and other enquiries stay unchanged."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild><button type="button" className="btn btn-line btn-sm" aria-label="Close"><X aria-hidden="true" /></button></Dialog.Close>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p><strong>Lead #{lead.leadNo}</strong> · {lead.customer.name}</p>
            <p className="muted mt-1">{lead.customer.mobile} · {lead.property.name}</p>
            <p className="mt-2">Current executive: <strong>{lead.assignedExecutive?.name ?? "Unassigned"}</strong></p>
            {!transfer && <p className="mt-1 text-xs text-muted-foreground">Split component: this existing property enquiry only.</p>}
          </div>

          <form action={formAction} className="mt-4 stack">
            <FormMessage state={state} />
            <div className={`field${state.fieldErrors?.targetExecutiveId ? " has-error" : ""}`}>
              <label htmlFor={`${operation}-targetExecutiveId`}>Destination executive</label>
              <select id={`${operation}-targetExecutiveId`} name="targetExecutiveId" defaultValue={state.values?.targetExecutiveId ?? ""} required disabled={pending}>
                <option value="">Choose an executive</option>
                {executives.map((e) => <option key={e.id} value={e.id}>{e.name}{e.designation === "EXECUTIVE_MANAGER" ? " (Executive Manager)" : ""}</option>)}
              </select>
              {state.fieldErrors?.targetExecutiveId && <p className="field-error">{state.fieldErrors.targetExecutiveId}</p>}
            </div>
            <div className="field">
              <label htmlFor={`${operation}-reason`}>Reason <span className="muted">(optional)</span></label>
              <textarea id={`${operation}-reason`} name="reason" rows={3} maxLength={500} defaultValue={state.values?.reason ?? ""} disabled={pending} placeholder={transfer ? "Why is ownership changing?" : "What part of this enquiry is being split?"} />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Dialog.Close asChild><button type="button" className="btn btn-line" disabled={pending}>Cancel</button></Dialog.Close>
              <button type="submit" className="btn btn-solid" disabled={pending} aria-busy={pending}>
                {pending ? <><Loader2 className="animate-spin" aria-hidden="true" /> Saving…</> : transfer ? "Confirm transfer" : "Confirm split"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
