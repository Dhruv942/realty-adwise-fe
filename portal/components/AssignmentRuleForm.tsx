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
          <label key={r.value} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-muted/40 has-[:checked]:border-foreground has-[:checked]:bg-muted/50">
            <input type="radio" name="rule" value={r.value} defaultChecked={r.value === setting.rule} className="mt-0.5 size-[18px] accent-primary" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{r.label}</span>
                {r.value === setting.defaultRule && <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Default</span>}
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
