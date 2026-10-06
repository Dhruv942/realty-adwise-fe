"use client";

import { useActionState } from "react";
import { idleState, type FormState } from "@/lib/types";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  label: string;
  pendingLabel?: string;
  variant?: "solid" | "line" | "danger";
  size?: "sm";
  confirm?: string;
  hidden?: Record<string, string>;
};

/** A one-button form for quick actions like activate, deactivate or delete. */
export function ActionForm({ action, label, pendingLabel, variant = "line", size, confirm, hidden }: Props) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="action-form">
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton variant={variant} size={size} pendingLabel={pendingLabel} confirm={confirm}>
        {label}
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
