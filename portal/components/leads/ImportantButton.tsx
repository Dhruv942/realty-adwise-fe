"use client";

import { useState, useTransition } from "react";
import { setImportantAction } from "@/lib/actions/leads";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ImportantButton({ role, id, initial }: { role: Role; id: string; initial: boolean }) {
  const [important, setImportant] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !important;
    setImportant(next);
    setError(null);
    startTransition(async () => {
      const result = await setImportantAction(role, id, next);
      if (result.ok) setImportant(result.isImportant);
      else {
        setImportant(!next);
        setError(result.message);
      }
    });
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={important}
        aria-label={important ? "Remove from important" : "Mark as important"}
        className={cn("inline-flex h-11 items-center rounded-full border px-4 font-display text-[11px] uppercase tracking-[.14em]", important ? "border-amber-300 bg-amber-100 text-amber-800" : "border-border-strong bg-card text-muted-foreground hover:bg-muted")}
      >
        {important ? "Important" : "Mark important"}
      </button>
      {error && (
        <span role="alert" className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg bg-foreground px-3 py-2 text-xs text-white">
          {error}
        </span>
      )}
    </span>
  );
}
