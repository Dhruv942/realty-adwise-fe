"use client";

import { useState, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  name: string;
  error?: string;
};

// Same markup as <Field>, plus a show/hide toggle inside the input.
export function PasswordField({ label, name, error, id, ...input }: Props) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? `f-${name}`;
  const tip = visible ? "Hide Password" : "Show Password";
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : undefined}
          {...input}
        />
        <button
          type="button"
          className="reveal"
          aria-label={tip}
          aria-controls={inputId}
          data-tip={tip}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeClosed /> : <EyeOpen />}
        </button>
      </div>
      {error && (
        <p className="field-error" id={`${inputId}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function EyeOpen() {
  return (
    <svg {...svgProps}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg {...svgProps}>
      <path d="M2.5 11c2.5 3 5.7 4.5 9.5 4.5s7-1.5 9.5-4.5" />
      <path d="M6 14.2 4.6 16.4M12 15.5V18M18 14.2l1.4 2.2" />
      <path d="M5 21 19 3" />
    </svg>
  );
}
