"use client";

import { useActionState } from "react";
import { idleState, type FormState, type LeadTimeoutSetting } from "@/lib/types";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function LeadTimeoutForm({ action, setting }: { action: (prev: FormState, formData: FormData) => Promise<FormState>; setting: LeadTimeoutSetting }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <Field
        label="Minutes to handle a lead"
        name="minutes"
        type="number"
        inputMode="numeric"
        required
        min={setting.minMinutes}
        max={setting.maxMinutes}
        step={1}
        defaultValue={state.values?.minutes ?? setting.minutes}
        error={state.fieldErrors?.minutes}
        hint={`Whole number from ${setting.minMinutes} to ${setting.maxMinutes}. Default ${setting.defaultMinutes}.${setting.isDefault ? " Currently the default." : ""}`}
      />
      <div>
        <SubmitButton pendingLabel="Saving…">Save time</SubmitButton>
      </div>
    </form>
  );
}
