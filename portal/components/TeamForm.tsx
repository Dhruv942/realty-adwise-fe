"use client";

import { useActionState } from "react";
import { idleState, type FormState, type Team } from "@/lib/types";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  team?: Pick<Team, "name" | "description">;
  submitLabel: string;
};

export function TeamForm({ action, team, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, idleState);
  const v = state.values;
  const err = state.fieldErrors;
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <Field label="Team name" name="name" required maxLength={100} defaultValue={v?.name ?? team?.name} error={err?.name} />
      <div className={`field${err?.description ? " has-error" : ""}`}>
        <label htmlFor="f-description">Description (optional)</label>
        <textarea
          id="f-description"
          name="description"
          maxLength={500}
          defaultValue={v?.description ?? team?.description ?? ""}
          aria-invalid={!!err?.description}
        />
        {err?.description && <p className="field-error">{err.description}</p>}
      </div>
      <div>
        <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
