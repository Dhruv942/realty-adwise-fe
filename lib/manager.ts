import "server-only";
import { cache } from "react";
import { authedRequest } from "./api";
import type { NewLead } from "./admin";
import type { Executive, Lead, LeadDetail } from "./types";
import { buildSplitRequest, buildTransferRequest, ownershipPath } from "./lead-ownership";

const m = <T>(path: string, options?: Parameters<typeof authedRequest>[2]) => authedRequest<T>("MANAGER", path, options);

export const listManagerExecutives = () => m<Executive[]>("/manager/executives");

export type ManagerLeadFilters = {
  status?: string;
  executiveId?: string;
  propertyId?: string;
  search?: string;
  important?: string;
  followUp?: string;
  source?: string;
  limit?: string;
  offset?: string;
};

export const listManagerLeads = (filters: ManagerLeadFilters = {}) => m<Lead[]>("/manager/leads", { query: filters });

export const getManagerLead = cache((id: string) => m<LeadDetail>(`/manager/leads/${encodeURIComponent(id)}`));

export const assignLeadAsManager = (id: string, executiveId: string) =>
  m<Lead>(`/manager/leads/${encodeURIComponent(id)}/assign`, { method: "PATCH", body: { executiveId } });

export const transferLeadAsManager = (id: string, executiveId: string, reason?: string) =>
  m<LeadDetail>(ownershipPath("MANAGER", id, "transfer"), buildTransferRequest(executiveId, reason));

export const splitLeadAsManager = (id: string, executiveId: string, reason?: string) =>
  m<LeadDetail>(ownershipPath("MANAGER", id, "split"), buildSplitRequest(executiveId, id, reason));

export const createLeadAsManager = (body: NewLead) => m<Lead>("/manager/leads", { method: "POST", body });
