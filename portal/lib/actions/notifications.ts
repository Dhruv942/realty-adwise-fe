"use server";

import { unstable_rethrow } from "next/navigation";
import { ApiError, authedRequest } from "@/lib/api";
import type { AppNotification, Role } from "@/lib/types";

export type NotificationList = { unreadCount: number; notifications: AppNotification[] };

const EMPTY: NotificationList = { unreadCount: 0, notifications: [] };

async function safe<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error); // expired session redirects
    if (error instanceof ApiError) return fallback;
    throw error;
  }
}

export async function listNotificationsAction(role: Role): Promise<NotificationList> {
  return safe(EMPTY, () => authedRequest<NotificationList>(role, "/notifications", { query: { limit: "30" } }));
}

export async function markNotificationReadAction(role: Role, id: string): Promise<boolean> {
  return safe(false, async () => {
    await authedRequest(role, `/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
    return true;
  });
}

export async function markAllNotificationsReadAction(role: Role): Promise<boolean> {
  return safe(false, async () => {
    await authedRequest(role, "/notifications/read-all", { method: "PATCH" });
    return true;
  });
}
