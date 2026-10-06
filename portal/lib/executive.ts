import "server-only";
import { cache } from "react";
import { authedRequest } from "./api";
import type { Lead, LeadDetail, LeadSummary } from "./types";

const e = <T>(path: string, options?: Parameters<typeof authedRequest>[2]) => authedRequest<T>("EXECUTIVE", path, options);

export type MyLeadFilters = { status?: string; search?: string; limit?: string; offset?: string; isNew?: string; important?: string };

export const listMyLeads = (filters: MyLeadFilters = {}) => e<Lead[]>("/executive/leads", { query: filters });

export const getLeadSummary = () => e<LeadSummary>("/executive/leads/summary");

/** Opening a lead clears its "new" tag, so only call this when the executive actually views it. */
export const getMyLead = cache((id: string) => e<LeadDetail>(`/executive/leads/${encodeURIComponent(id)}`));

export const setMyLeadStatus = (id: string, status: string) =>
  e<Lead>(`/executive/leads/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } });
