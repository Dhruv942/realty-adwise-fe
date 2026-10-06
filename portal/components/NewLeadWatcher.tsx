"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Re-fetches the page every few seconds and toasts when the number of unopened leads goes up. */
export function NewLeadWatcher({ newLeads, intervalMs = 15000 }: { newLeads: number; intervalMs?: number }) {
  const router = useRouter();
  const last = useRef(newLeads);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);

  useEffect(() => {
    if (newLeads > last.current) {
      const n = newLeads - last.current;
      setToast(`${n} new lead${n === 1 ? "" : "s"} assigned to you`);
    }
    last.current = newLeads;
  }, [newLeads]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <span>{toast}</span>
      <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
        ×
      </button>
    </div>
  );
}
