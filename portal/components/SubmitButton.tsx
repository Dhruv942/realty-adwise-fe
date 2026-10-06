"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "solid" | "line" | "danger";
  size?: "sm";
  confirm?: string;
};

/** Submit button that shows progress, and explains the wait when the backend is cold-starting. */
export function SubmitButton({ children, pendingLabel = "Working…", variant = "solid", size, confirm }: Props) {
  const { pending } = useFormStatus();
  const slow = useSlow(pending);

  return (
    <span className="submit">
      <button
        type="submit"
        className={`btn btn-${variant}${size ? ` btn-${size}` : ""}`}
        disabled={pending}
        aria-busy={pending}
        onClick={(event) => {
          if (confirm && !window.confirm(confirm)) event.preventDefault();
        }}
      >
        {pending ? pendingLabel : children}
      </button>
      {slow && process.env.NEXT_PUBLIC_SHOW_WAKEUP_HINT && (
        <span className="hint">The server is waking up. This can take about 30 seconds.</span>
      )}
    </span>
  );
}

function useSlow(pending: boolean, afterMs = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!pending) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), afterMs);
    return () => clearTimeout(timer);
  }, [pending, afterMs]);
  return slow;
}
