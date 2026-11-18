"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { disconnectZoho, getZohoConnectRedirect, retryZohoNotification, sendZohoTestEmail, updateZohoNotifications } from "@/lib/zoho";
import type { FormState } from "@/lib/types";

const ok = (message: string): FormState => ({ status: "success", message });

export async function connectZohoAction(): Promise<never> {
  let location: string;
  try {
    location = await getZohoConnectRedirect();
  } catch {
    redirect("/admin/settings?zoho=error");
  }
  redirect(location);
}

export async function sendZohoTestEmailAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const toAddress = typeof formData.get("toAddress") === "string" ? String(formData.get("toAddress")).trim() : "";
  if (!toAddress) return { status: "error", fieldErrors: { toAddress: "Enter a recipient email address." } };
  try { await sendZohoTestEmail(toAddress); return ok("Test email sent successfully."); } catch (error) { return { status: "error", message: error instanceof ApiError ? error.message : "Unable to send test email." }; }
}

export async function disconnectZohoAction(): Promise<FormState> {
  try { await disconnectZoho(); return ok("Zoho Mail disconnected."); } catch (error) { return { status: "error", message: error instanceof ApiError ? error.message : "Unable to disconnect Zoho Mail." }; }
}

export async function setZohoNotificationsAction(enabled: boolean): Promise<FormState> {
  try { await updateZohoNotifications(enabled); return ok(enabled ? "Assignment emails enabled." : "Assignment emails disabled."); } catch (error) { return { status: "error", message: error instanceof ApiError ? error.message : "Unable to update assignment emails." }; }
}

export async function retryZohoNotificationAction(notificationId: string): Promise<FormState> {
  try { await retryZohoNotification(notificationId); return ok("Email retry requested."); } catch (error) { return { status: "error", message: error instanceof ApiError ? error.message : "Unable to retry this email." }; }
}
