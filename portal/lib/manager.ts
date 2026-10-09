import "server-only";
import { cache } from "react";
import { authedRequest } from "./api";
import type { NewLead } from "./admin";
import type { Executive, Lead, LeadDetail, Team } from "./types";

const m = <T>(path: string, options?: Parameters<typeof authedRequest>[2]) => authedRequest<T>("MANAGER", path, options);

export const listManagerTeams = () => m<Team[]>("/manager/teams");
export const listManagerExecutives = () => m<Executive[]>("/manager/executives");

export type ManagerLeadFilters = {
  status?: string;
  executiveId?: string;
  propertyId?: string;
  search?: string;
  important?: string;
  followUp?: string;
  limit?: string;
  offset?: string;
};

export const listManagerLeads = (filters: ManagerLeadFilters = {}) => m<Lead[]>("/manager/leads", { query: filters });

export const getManagerLead = cache((id: string) => m<LeadDetail>(`/manager/leads/${encodeURIComponent(id)}`));

export const assignLeadAsManager = (id: string, executiveId: string) =>
  m<Lead>(`/manager/leads/${encodeURIComponent(id)}/assign`, { method: "PATCH", body: { executiveId } });

export const createLeadAsManager = (body: NewLead) => m<Lead>("/manager/leads", { method: "POST", body });
