"use client";

import { getPushPublicKeyAction, removePushSubscriptionAction, savePushSubscriptionAction, type PushSubscriptionJson } from "@/lib/actions/push";
import type { Role } from "@/lib/types";

export type PushState = "unsupported" | "needs-install" | "denied" | "off" | "on";

const toKey = (b64: string) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

export const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** What this browser can do right now, without asking for anything. */
export async function pushState(): Promise<PushState> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    // iPhone only gets these APIs once the portal is added to the Home Screen.
    return isIos() && !isStandalone() ? "needs-install" : "unsupported";
  }
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission !== "granted") return "off";
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  return (await reg?.pushManager.getSubscription()) ? "on" : "off";
}

/**
 * Subscribes this browser and binds it to the signed-in user. `ask` is true only from a button click: the browser
 * shows its permission prompt then. Without it, this only re-binds a device that already has permission.
 */
export async function enablePush(role: Role, ask: boolean): Promise<PushState> {
  const state = await pushState();
  if (state === "unsupported" || state === "needs-install" || state === "denied") return state;
  if (Notification.permission !== "granted") {
    if (!ask) return "off";
    if ((await Notification.requestPermission()) !== "granted") return Notification.permission === "denied" ? "denied" : "off";
  }
  const key = await getPushPublicKeyAction(role);
  if (!key) return "unsupported"; // push is not configured on the server
  const reg = (await navigator.serviceWorker.getRegistration("/sw.js")) ?? (await navigator.serviceWorker.register("/sw.js"));
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(key) }));
  const ok = await savePushSubscriptionAction(role, sub.toJSON() as PushSubscriptionJson);
  return ok ? "on" : "off";
}

/** Call BEFORE the session is cleared, so the server still accepts the request. */
export async function disablePush(role: Role): Promise<void> {
  try {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await removePushSubscriptionAction(role, sub.endpoint);
    await sub.unsubscribe();
  } catch {
    // Logging out must never fail because of this.
  }
}
