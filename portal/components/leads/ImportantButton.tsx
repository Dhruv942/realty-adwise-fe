"use client";

import { useState, useTransition } from "react";
import { setImportantAction } from "@/lib/actions/leads";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

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
        className={cn("btn btn-line", important && "!border-warning/50 !bg-warning-soft text-warning")}
      >
        <Star className={cn(important && "fill-current")} aria-hidden="true" />
        {important ? "Important" : "Mark important"}
      </button>
      {error && (
        <span role="alert" className="absolute right-0 top-full z-10 mt-1.5 w-56 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-destructive shadow-lg">
          {error}
        </span>
      )}
    </span>
  );
}
