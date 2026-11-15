"use client";

import { useActionState } from "react";
import { idleState, type Executive, type FormState, type Manager } from "@/lib/types";
import { Field } from "./Field";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const USERNAME_PATTERN = "[A-Za-z0-9._\\-]{3,50}";
const PHONE_PATTERN = "\\+?[0-9]{7,15}";

export function ProfileFields({ state, executive, showDesignation = true }: { state: FormState; executive?: Pick<Executive, "name" | "email" | "username" | "phone"> & { designation?: Executive["designation"] }; showDesignation?: boolean }) {
  const v = state.values;
  const err = state.fieldErrors;
  return (
    <div className="grid-2">
      <Field label="Full name" name="name" required maxLength={100} autoComplete="off" defaultValue={v?.name ?? executive?.name} error={err?.name} />
      <Field label="Email" name="email" type="email" required autoComplete="off" defaultValue={v?.email ?? executive?.email} error={err?.email} hint="Used to sign in." />
      <Field
        label="Username"
        name="username"
        required
        minLength={3}
        maxLength={50}
        pattern={USERNAME_PATTERN}
        autoComplete="off"
        defaultValue={v?.username ?? executive?.username}
        error={err?.username}
        hint="Letters, numbers, dots, underscores and hyphens."
      />
      <Field
        label="Phone (optional)"
        name="phone"
        type="tel"
        pattern={PHONE_PATTERN}
        autoComplete="off"
        defaultValue={v?.phone ?? executive?.phone ?? ""}
        error={err?.phone}
        hint="7 to 15 digits, optional leading +."
      />
      {showDesignation && (
      <div className={`field${err?.designation ? " has-error" : ""}`}>
        <label htmlFor="f-designation">Designation</label>
        <select id="f-designation" name="designation" defaultValue={v?.designation ?? executive?.designation ?? "SALES_EXECUTIVE"}>
          <option value="SALES_EXECUTIVE">Sales Executive</option>
          <option value="EXECUTIVE_MANAGER">Executive Manager</option>
        </select>
        <p className="field-hint">A label only. Both have the same access.</p>
      </div>
      )}
    </div>
  );
}

function ManagerSelect({
  managers,
  state,
  label,
  allowNone,
  defaultManagerId = "",
}: {
  managers: Manager[];
  state: FormState;
  label: string;
  allowNone: boolean;
  defaultManagerId?: string;
}) {
  const error = state.fieldErrors?.managerId;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor="f-managerId">{label}</label>
      <select id="f-managerId" name="managerId" defaultValue={state.values?.managerId ?? defaultManagerId} required={!allowNone}>
        <option value="">{allowNone ? "No manager for now" : "Choose a manager"}</option>
        {managers.map((manager) => (
          <option key={manager.id} value={manager.id}>
            {manager.name}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function CreateExecutiveForm({ action, managers, defaultManagerId }: { action: Action; managers: Manager[]; defaultManagerId?: string }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <ProfileFields state={state} />
      <div className="grid-2">
        <Field
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={200}
          autoComplete="new-password"
          error={state.fieldErrors?.password}
          hint="At least 8 characters. Share it with the executive securely."
        />
        <ManagerSelect managers={managers} state={state} label="Manager (optional)" allowNone defaultManagerId={defaultManagerId} />
      </div>
      {managers.length === 0 && <p className="field-hint">No active managers yet. You can assign one later.</p>}
      <div>
        <SubmitButton pendingLabel="Creating…">Create executive</SubmitButton>
      </div>
    </form>
  );
}

export function EditExecutiveForm({ action, executive }: { action: Action; executive: Executive }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <ProfileFields state={state} executive={executive} />
      <div>
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <Field label="New password" name="password" type="password" required minLength={8} maxLength={200} autoComplete="new-password" error={state.fieldErrors?.password} />
      <Field label="Confirm password" name="confirm" type="password" required minLength={8} maxLength={200} autoComplete="new-password" error={state.fieldErrors?.confirm} />
      <div>
        <SubmitButton variant="line" pendingLabel="Resetting…">
          Reset password
        </SubmitButton>
      </div>
    </form>
  );
}

export function AssignManagerForm({ action, managers, label }: { action: Action; managers: Manager[]; label: string }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <ManagerSelect managers={managers} state={state} label="Manager" allowNone={false} />
      <div>
        <SubmitButton variant="line" pendingLabel="Saving…">
          {label}
        </SubmitButton>
      </div>
    </form>
  );
}
