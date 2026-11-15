"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CHANNEL = "ra-auth";
const RECHECK_AFTER_MS = 60_000;

/** Tells the other open tabs that this one signed out. Called from the logout form. */
export function broadcastLogout() {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage("logout");
    channel.close();
  } catch {
    // No BroadcastChannel: other tabs find out on their next navigation, when the proxy sends them to /login.
  }
}

/**
 * Keeps every open tab consistent with the one session: another tab signing out sends this one to the login page,
 * a page restored from the back/forward cache after sign-out is reloaded (so it can't show stale data), and a tab
 * coming back into view re-checks the session (renewing it, or sending the user to sign in if it ended).
 */
export function AuthSync() {
  const router = useRouter();
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (e) => {
        if (e.data === "logout") window.location.assign("/login");
      };
    } catch {
      channel = null;
    }
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    let last = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < RECHECK_AFTER_MS) return;
      last = Date.now();
      router.refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      channel?.close();
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);
  return null;
}
