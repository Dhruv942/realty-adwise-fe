"use client";

import { useActionState } from "react";
import { idleState, type AssignmentRuleSetting, type FormState } from "@/lib/types";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function AssignmentRuleForm({ action, setting }: { action: (prev: FormState, formData: FormData) => Promise<FormState>; setting: AssignmentRuleSetting }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <fieldset className="grid gap-2 border-0 p-0">
        <legend className="sr-only">Assignment rule</legend>
        {setting.availableRules.map((r) => (
          <label key={r.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-foreground has-[:checked]:bg-muted/60">
            <input type="radio" name="rule" value={r.value} defaultChecked={r.value === setting.rule} className="mt-1 size-5 accent-[#1b1b1c]" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span>{r.label}</span>
                {r.value === setting.defaultRule && <span className="badge badge-info">Default</span>}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{r.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {state.fieldErrors?.rule && <p className="field-error">{state.fieldErrors.rule}</p>}
      <p className="hint">Applies to the next lead. Leads that are already assigned are not changed.</p>
      <div>
        <SubmitButton pendingLabel="Saving…">Save rule</SubmitButton>
      </div>
    </form>
  );
}
