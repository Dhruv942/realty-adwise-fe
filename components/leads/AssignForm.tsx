"use client";

import { useActionState } from "react";
import { idleState, type FormState } from "@/lib/types";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";

export function AssignForm({
  action,
  executives,
  currentId,
  label,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  executives: { id: string; name: string; designation?: string }[];
  currentId?: string;
  label: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const err = state.fieldErrors?.executiveId;
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <div className={`field${err ? " has-error" : ""}`}>
        <label htmlFor="f-executiveId">Executive</label>
        <select id="f-executiveId" name="executiveId" defaultValue={currentId ?? ""} required>
          <option value="">Choose an executive</option>
          {executives.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.designation === "EXECUTIVE_MANAGER" ? " (Executive Manager)" : ""}
            </option>
          ))}
        </select>
        {err && <p className="field-error">{err}</p>}
      </div>
      <div>
        <SubmitButton variant="line" pendingLabel="Assigning…">
          {label}
        </SubmitButton>
      </div>
    </form>
  );
}
