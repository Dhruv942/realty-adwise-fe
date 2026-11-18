"use server";

import { unstable_rethrow } from "next/navigation";
import { ApiError, authedRequest } from "@/lib/api";
import type { Role } from "@/lib/types";

export type PushSubscriptionJson = { endpoint: string; expirationTime: number | null; keys: { p256dh: string; auth: string } };

/** `null` when the server has no push keys (503): the portal hides the toggle. */
export async function getPushPublicKeyAction(role: Role): Promise<string | null> {
  try {
    return (await authedRequest<{ publicKey: string }>(role, "/push/public-key")).publicKey;
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError) return null;
    throw error;
  }
}

export async function savePushSubscriptionAction(role: Role, subscription: PushSubscriptionJson): Promise<boolean> {
  try {
    await authedRequest(role, "/push/subscriptions", { method: "POST", body: subscription });
    return true;
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError) return false;
    throw error;
  }
}

export async function removePushSubscriptionAction(role: Role, endpoint: string): Promise<boolean> {
  try {
    await authedRequest(role, "/push/subscriptions", { method: "DELETE", body: { endpoint } });
    return true;
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError) return false;
    throw error;
  }
}
