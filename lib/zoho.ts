import "server-only";
import { authedRawRequest, authedRequest } from "./api";

export type ZohoFailure = { id?: string; notificationId?: string; leadNo?: number; recipient?: string; status?: string; attempts?: number; error?: string; createdAt?: string };
export type ZohoStatus = { status: "CONNECTED" | "DISCONNECTED" | "REAUTHORIZATION_REQUIRED" | string; connectedEmail: string | null; notificationEnabled: boolean; connectedAt: string | null; lastSuccessfulVerificationAt: string | null; lastError: string | null; recentFailures: ZohoFailure[] };

export const getZohoStatus = () => authedRequest<ZohoStatus>("ADMIN", "/integrations/zoho/status");

export async function getZohoConnectRedirect(): Promise<string> {
  const response = await authedRawRequest("ADMIN", "/auth/zoho/connect", undefined, { redirect: "manual" });
  const location = response.headers.get("location");
  if (!location) throw new Error("Zoho did not return an authorization URL.");
  return location;
}

export const sendZohoTestEmail = (toAddress: string) => authedRequest<unknown>("ADMIN", "/integrations/zoho/test-email", { method: "POST", body: { toAddress } });
export const disconnectZoho = () => authedRequest<unknown>("ADMIN", "/integrations/zoho/disconnect", { method: "POST" });
export const updateZohoNotifications = (enabled: boolean) => authedRequest<ZohoStatus>("ADMIN", "/integrations/zoho/notifications", { method: "PATCH", body: { enabled } });
export const retryZohoNotification = (notificationId: string) => authedRequest<unknown>("ADMIN", `/integrations/zoho/notifications/${encodeURIComponent(notificationId)}/retry`, { method: "POST" });
