import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

export function Field({ label, name, error, hint, id, ...input }: Props) {
  const inputId = id ?? `f-${name}`;
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} name={name} aria-invalid={!!error} aria-describedby={describedBy} {...input} />
      {error ? (
        <p className="field-error" id={`${inputId}-err`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
