import type { Role } from "./types";

export type OwnershipOperation = "transfer" | "split";
export type OwnershipRequest = { method: "POST"; body: Record<string, unknown> };

const AREA: Record<Exclude<Role, "EXECUTIVE">, string> = { ADMIN: "admin", MANAGER: "manager" };

export function ownershipPath(role: Exclude<Role, "EXECUTIVE">, leadId: string, operation: OwnershipOperation): string {
  return `/${AREA[role]}/leads/${encodeURIComponent(leadId)}/${operation}`;
}

export function buildTransferRequest(targetExecutiveId: string, reason?: string): OwnershipRequest {
  return { method: "POST", body: { targetExecutiveId, ...(reason?.trim() ? { reason: reason.trim() } : {}) } };
}

export function buildSplitRequest(targetExecutiveId: string, leadId: string, reason?: string): OwnershipRequest {
  return {
    method: "POST",
    body: {
      targetExecutiveId,
      component: { type: "ENQUIRY", leadId },
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  };
}
