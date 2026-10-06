"use client";

import { useActionState } from "react";
import { idleState, type FormState, type Property, type PropertyExecutive } from "@/lib/types";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function EditPropertyForm({ action, property }: { action: Action; property: Property }) {
  const [state, formAction] = useActionState(action, idleState);
  const v = state.values;
  const err = state.fieldErrors;
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <div className="grid-2">
        <Field label="Name" name="name" required maxLength={150} defaultValue={v?.name ?? property.name} error={err?.name} />
        <Field label="Location (optional)" name="location" maxLength={200} defaultValue={v?.location ?? property.location ?? ""} error={err?.location} />
      </div>
      <div className={`field${err?.description ? " has-error" : ""}`}>
        <label htmlFor="f-description">Description (optional)</label>
        <textarea id="f-description" name="description" maxLength={2000} defaultValue={v?.description ?? property.description ?? ""} aria-invalid={!!err?.description} />
        {err?.description && <p className="field-error">{err.description}</p>}
      </div>
      <div>
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}

type Choice = { id: string; name: string; username: string; teamName: string | null };

export function AssignExecutivesForm({
  action,
  choices,
  selected,
  inactiveSelected,
}: {
  action: Action;
  choices: Choice[];
  selected: string[];
  inactiveSelected: PropertyExecutive[];
}) {
  const [state, formAction] = useActionState(action, idleState);
  const chosen = new Set(selected);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      {choices.length === 0 ? (
        <p className="muted">No active executives yet.</p>
      ) : (
        <fieldset className="pick-list">
          <legend className="muted">Leads are shared round-robin between the checked executives.</legend>
          {choices.map((c) => (
            <label key={c.id} className="pick">
              <input type="checkbox" name="executiveIds" value={c.id} defaultChecked={chosen.has(c.id)} />
              <span className="avatar avatar-sm" aria-hidden="true">
                {c.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")}
              </span>
              <span>
                {c.name}
                <span className="muted person-sub"> @{c.username}{c.teamName ? ` · ${c.teamName}` : ""}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      {inactiveSelected.length > 0 && (
        <p className="field-hint">
          Inactive and skipped: {inactiveSelected.map((e) => e.name).join(", ")}. Saving removes them from this property.
        </p>
      )}
      <div>
        <SubmitButton pendingLabel="Saving…">Save executives</SubmitButton>
      </div>
    </form>
  );
}
