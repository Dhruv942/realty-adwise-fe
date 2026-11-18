"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const KEY = "ra_install_dismissed";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

function snoozed() {
  try {
    const at = Number(localStorage.getItem(KEY));
    return at > 0 && Date.now() - at < SNOOZE_MS;
  } catch {
    return false;
  }
}

/** Phone-only banner offering to install the app. Android/Chrome gets the native prompt; iPhone gets steps. */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const [steps, setSteps] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || snoozed()) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      setIos(true);
      setVisible(true);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    setEvent(null);
    if (choice.outcome === "accepted") setVisible(false);
    else dismiss();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install the app"
      className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 rounded-xl border border-border bg-surface-elevated p-3.5 shadow-lg sm:hidden"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary font-display text-xs font-bold text-primary-foreground">RA</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Install Realty Adwise</p>
          <p className="text-[13px] text-muted-foreground">Open it from your home screen, like an app.</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Not now" className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      {event && (
        <button type="button" onClick={install} className="btn btn-solid mt-3 min-h-11 w-full">
          <Download aria-hidden="true" /> Download app
        </button>
      )}

      {!event && ios && (
        <>
          <button type="button" onClick={() => setSteps((s) => !s)} className="btn btn-solid mt-3 min-h-11 w-full">
            <Download aria-hidden="true" /> Download app
          </button>
          {steps && (
            <ol className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
              <li>
                1. Tap the <Share className="mx-0.5 inline size-4" /> Share button in Safari.
              </li>
              <li>2. Choose “Add to Home Screen”.</li>
              <li>3. Tap “Add”.</li>
            </ol>
          )}
        </>
      )}
    </div>
  );
}
