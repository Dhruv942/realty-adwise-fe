"use client";

import { useActionState } from "react";
import { idleState, type Executive, type FormState, type Team } from "@/lib/types";
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

function TeamSelect({
  teams,
  state,
  label,
  allowNone,
  defaultTeamId = "",
}: {
  teams: Team[];
  state: FormState;
  label: string;
  allowNone: boolean;
  defaultTeamId?: string;
}) {
  const error = state.fieldErrors?.teamId;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor="f-teamId">{label}</label>
      <select id="f-teamId" name="teamId" defaultValue={state.values?.teamId ?? defaultTeamId} required={!allowNone}>
        <option value="">{allowNone ? "No team for now" : "Choose a team"}</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function CreateExecutiveForm({ action, teams, defaultTeamId }: { action: Action; teams: Team[]; defaultTeamId?: string }) {
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
        <TeamSelect teams={teams} state={state} label="Team (optional)" allowNone defaultTeamId={defaultTeamId} />
      </div>
      {teams.length === 0 && <p className="field-hint">No active teams yet. You can assign a team later.</p>}
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

export function AssignTeamForm({ action, teams, label }: { action: Action; teams: Team[]; label: string }) {
  const [state, formAction] = useActionState(action, idleState);
  return (
    <form action={formAction} className="stack">
      <FormMessage state={state} />
      <TeamSelect teams={teams} state={state} label="Team" allowNone={false} />
      <div>
        <SubmitButton variant="line" pendingLabel="Saving…">
          {label}
        </SubmitButton>
      </div>
    </form>
  );
}
