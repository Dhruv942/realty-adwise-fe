"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ENQUIRY_LABEL, LEAD_SOURCES, LEAD_STATUSES, MANUAL_SUB_SOURCES, MANUAL_SUB_SOURCE_LABEL, idleState, sourceLabel, type FormState, type LeadStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function CreateLeadForm({ action, executives, properties }: { action: Action; executives?: { id: string; name: string }[]; properties?: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(action, idleState);
  const v = state.values;
  const err = state.fieldErrors;
  const initialProperty = v?.propertyName && properties?.some((property) => property.name === v.propertyName) ? v.propertyName : "__new__";
  const [propertyChoice, setPropertyChoice] = useState(initialProperty);
  const [sourceChoice, setSourceChoice] = useState(v?.source ?? "");
  return (
    <form key={state.status === "error" ? JSON.stringify(v ?? {}) : "clean"} action={formAction} className="stack">
      <FormMessage state={state} />
      <div className="grid-2">
        <Field label="Customer name" name="name" required maxLength={100} defaultValue={v?.name} error={err?.name} />
        <Field label="Mobile" name="mobile" type="tel" required defaultValue={v?.mobile} error={err?.mobile} hint="Any format, e.g. 98765 43210 or +91-98765-43210." />
        <Field label="Email (optional)" name="email" type="email" defaultValue={v?.email} error={err?.email} />
        {properties ? (
          <div className={`field${err?.propertyName ? " has-error" : ""}`}>
            <label htmlFor="f-propertyName">Property name</label>
            <select id="f-propertyName" name={propertyChoice === "__new__" ? "propertyChoice" : "propertyName"} required value={propertyChoice} onChange={(event) => setPropertyChoice(event.target.value)}>
              <option value="">Choose a property</option>
              {properties.map((property) => <option key={property.id} value={property.name}>{property.name}</option>)}
              <option value="__new__">＋ Add new property</option>
            </select>
            {propertyChoice === "__new__" && <input name="propertyName" required placeholder="Enter new property name" defaultValue={initialProperty === "__new__" ? v?.propertyName : ""} className="mt-2" />}
            {err?.propertyName ? <p className="field-error">{err.propertyName}</p> : <p className="field-hint">Choose an existing property or add a new one.</p>}
          </div>
        ) : (
          <Field label="Property name" name="propertyName" required defaultValue={v?.propertyName} error={err?.propertyName} hint="A new property is created automatically if the name is new." />
        )}
        <div className={`field${err?.source ? " has-error" : ""}`}>
          <label htmlFor="f-source">Source</label>
          <select id="f-source" name="source" required value={sourceChoice} onChange={(event) => setSourceChoice(event.target.value)}>
            <option value="">Choose a source</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {sourceLabel(s)}
              </option>
            ))}
          </select>
          {err?.source && <p className="field-error">{err.source}</p>}
        </div>
        {sourceChoice === "MANUAL" && (
          <div className={`field${err?.manualSubSource ? " has-error" : ""}`}>
            <label htmlFor="f-manualSubSource">Manual source (optional)</label>
            <select id="f-manualSubSource" name="manualSubSource" defaultValue={v?.manualSubSource ?? ""}>
              <option value="">Choose a source detail</option>
              {MANUAL_SUB_SOURCES.map((value) => <option key={value} value={value}>{MANUAL_SUB_SOURCE_LABEL[value]}</option>)}
            </select>
            {err?.manualSubSource && <p className="field-error">{err.manualSubSource}</p>}
          </div>
        )}
        <Field label="Requirement (optional)" name="requirement" maxLength={200} defaultValue={v?.requirement} error={err?.requirement} hint="e.g. 3 BHK on Rent" />
        <fieldset className={`field${err?.enquiryType ? " has-error" : ""}`}>
          <legend>Looking to (optional)</legend>
          <div className="flex gap-5 pt-1">
            {(["RENT", "BUY"] as const).map((o) => (
              <label key={o} className="flex items-center gap-2">
                <input type="radio" name="enquiryType" value={o} defaultChecked={v?.enquiryType === o} className="lead-enquiry-radio size-[18px]" />
                {ENQUIRY_LABEL[o]}
              </label>
            ))}
          </div>
          {err?.enquiryType && <p className="field-error">{err.enquiryType}</p>}
        </fieldset>
        {executives && (
          <div className={`field${err?.executiveId ? " has-error" : ""}`}>
            <label htmlFor="f-executiveId">Assign to</label>
            <select id="f-executiveId" name="executiveId" required defaultValue={v?.executiveId ?? ""}>
              <option value="">Choose an executive</option>
              {executives.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            {err?.executiveId ? <p className="field-error">{err.executiveId}</p> : <p className="field-hint">The lead goes straight to this executive. Only executives who report to you are listed.</p>}
          </div>
        )}
        <Field label="Budget in rupees (optional)" name="budget" inputMode="numeric" defaultValue={v?.budget} error={err?.budget} hint="e.g. 8000000 for ₹80 Lakh." />
      </div>
      <div className={`field${err?.message ? " has-error" : ""}`}>
        <label htmlFor="f-message">Message (optional)</label>
        <textarea id="f-message" name="message" maxLength={2000} defaultValue={v?.message} aria-invalid={!!err?.message} />
        {err?.message && <p className="field-error">{err.message}</p>}
      </div>
      <div>
        <SubmitButton pendingLabel="Adding…">Add lead</SubmitButton>
      </div>
    </form>
  );
}

export function LeadStatusForm({ action, current }: { action: Action; current: LeadStatus }) {
  const [state, formAction] = useActionState(action, idleState);
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <div className="field">
        <label htmlFor="f-status">Status</label>
        <select id="f-status" name="status" defaultValue={current}>
          {LEAD_STATUSES.filter((s) => s !== "PENDING_ASSIGNMENT").map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <SubmitButton variant="line" pendingLabel="Saving…">
          Update status
        </SubmitButton>
      </div>
    </form>
  );
}

export function EditCustomerForm({ action, customer }: { action: Action; customer: { name: string; email: string | null; mobile: string } }) {
  const [state, formAction] = useActionState(action, idleState);
  const v = state.values;
  const err = state.fieldErrors;
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <div className="grid-2">
        <Field label="Name" name="name" required maxLength={100} defaultValue={v?.name ?? customer.name} error={err?.name} />
        <Field label="Email (optional)" name="email" type="email" defaultValue={v?.email ?? customer.email ?? ""} error={err?.email} />
        <Field label="Mobile" name="mobile" value={customer.mobile} readOnly hint="The mobile number can't be changed." />
      </div>
      <div>
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
