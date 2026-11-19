import type { Role } from "./types";

export type OwnershipRequest = { method: "POST"; body: Record<string, unknown> };

const AREA: Record<Exclude<Role, "EXECUTIVE">, string> = { ADMIN: "admin", MANAGER: "manager" };

export function ownershipPath(role: Exclude<Role, "EXECUTIVE">, leadId: string): string {
  return `/${AREA[role]}/leads/${encodeURIComponent(leadId)}/transfer`;
}

export function buildTransferRequest(targetExecutiveId: string, reason?: string): OwnershipRequest {
  return { method: "POST", body: { targetExecutiveId, ...(reason?.trim() ? { reason: reason.trim() } : {}) } };
}
