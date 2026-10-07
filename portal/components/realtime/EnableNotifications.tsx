"use client";

import { Bell, BellOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { disablePush, enablePush, isIos, pushState, type PushState } from "@/lib/push-client";
import type { Role } from "@/lib/types";

const KEY = "ra_push_dismissed";

/** Banner offering phone/desktop alerts for new leads and SLA warnings, even with the app closed. */
export function EnableNotifications({ role }: { role: Role }) {
  const [state, setState] = useState<PushState | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      setDismissed(localStorage.getItem(KEY) === "1");
    } catch {
      setDismissed(false);
    }
    (async () => {
      const current = await pushState();
      if (cancelled) return;
      setState(current);
      // Already allowed: quietly bind this device to whoever is signed in now (a shared browser stays correct).
      if (current === "on" || (current === "off" && Notification.permission === "granted")) {
        const next = await enablePush(role, false).catch(() => current);
        if (!cancelled) setState(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (state === null || state === "unsupported") return null;
  if (state === "on") return null;
  if (state === "off" && dismissed) return null;

  const hide = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setDismissed(true);
  };

  async function turnOn() {
    setBusy(true);
    try {
      setState(await enablePush(role, true));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 text-sm" role="region" aria-label="Notifications">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-muted">
        {state === "denied" ? <BellOff className="size-4" aria-hidden="true" /> : <Bell className="size-4" aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1">
        {state === "off" && (
          <>
            <p className="font-medium">Get alerts for new leads</p>
            <p className="text-muted-foreground">We&apos;ll notify you when a lead is assigned to you and before its response time runs out, even when the app is closed.</p>
            <button type="button" onClick={turnOn} disabled={busy} className="btn btn-solid btn-sm mt-2">
              {busy ? "Turning on…" : "Turn on notifications"}
            </button>
          </>
        )}
        {state === "needs-install" && (
          <>
            <p className="font-medium">Add the app to your Home Screen for alerts</p>
            <p className="text-muted-foreground">
              On iPhone, tap Share, then &ldquo;Add to Home Screen&rdquo;. Open the app from there and turn on notifications.
            </p>
          </>
        )}
        {state === "denied" && (
          <>
            <p className="font-medium">Notifications are blocked</p>
            <p className="text-muted-foreground">
              {isIos() ? "Open Settings, then Notifications, find this app and allow them." : "Click the lock icon next to the address bar, set Notifications to Allow, then reload."}
            </p>
          </>
        )}
      </div>
      {(state === "off" || state === "needs-install") && (
        <button type="button" onClick={hide} aria-label="Hide" className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export { disablePush };
