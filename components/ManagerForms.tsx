"use client";

import { useActionState } from "react";
import { idleState, type FormState, type Manager } from "@/lib/types";
import { ProfileFields } from "./ExecutiveForms";
import { FormMessage } from "./FormMessage";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function CreateManagerForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <ProfileFields state={state} showDesignation={false} />
      <PasswordField label="Password" name="password" autoComplete="new-password" required minLength={8} maxLength={200} error={state.fieldErrors?.password} />
      <div>
        <SubmitButton pendingLabel="Creating…">Create manager</SubmitButton>
      </div>
    </form>
  );
}

export function EditManagerForm({ action, manager }: { action: Action; manager: Manager }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <ProfileFields state={state} executive={manager} showDesignation={false} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
