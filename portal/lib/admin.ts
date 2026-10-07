import "server-only";
import { cache } from "react";
import { authedRequest } from "./api";
import type { AssignmentHistoryEntry, AssignmentRuleSetting, Customer, LeadTimeoutSetting, Manager, ManagerDetail, CustomerDetail, Executive, Lead, LeadDetail, Property, PropertyDetail, Team, TeamDetail } from "./types";

const a = <T>(path: string, options?: Parameters<typeof authedRequest>[2]) => authedRequest<T>("ADMIN", path, options);
const enc = encodeURIComponent;

// ---- Teams ----

export type TeamFilters = { isActive?: string; search?: string; managerId?: string };

export const listTeams = (filters: TeamFilters = {}) => a<Team[]>("/admin/teams", { query: filters });

// cache() dedupes the call when generateMetadata and the page both need the record.
export const getTeam = cache((id: string) => a<TeamDetail>(`/admin/teams/${enc(id)}`));

export const createTeam = (body: { name: string; description: string | null; managerId?: string | null }) =>
  a<Team>("/admin/teams", { method: "POST", body });

export const updateTeam = (id: string, body: { name?: string; description?: string | null; managerId?: string | null }) =>
  a<Team>(`/admin/teams/${enc(id)}`, { method: "PATCH", body });

export const setTeamStatus = (id: string, isActive: boolean) =>
  a<Team>(`/admin/teams/${enc(id)}/status`, { method: "PATCH", body: { isActive } });

// ---- Executives ----

export type ExecutiveFilters = { teamId?: string; isActive?: string; search?: string };

export type NewExecutive = {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string | null;
  teamId: string | null;
  designation?: string;
};

export type ExecutiveChanges = Partial<Pick<Executive, "name" | "email" | "username" | "phone" | "designation">>;

export const listExecutives = (filters: ExecutiveFilters = {}) =>
  a<Executive[]>("/admin/executives", { query: filters });

export const getExecutive = cache((id: string) => a<Executive>(`/admin/executives/${enc(id)}`));

export const createExecutive = (body: NewExecutive) => a<Executive>("/admin/executives", { method: "POST", body });

export const updateExecutive = (id: string, body: ExecutiveChanges) =>
  a<Executive>(`/admin/executives/${enc(id)}`, { method: "PATCH", body });

export const resetExecutivePassword = (id: string, password: string) =>
  a<unknown>(`/admin/executives/${enc(id)}/password`, { method: "PATCH", body: { password } });

export const setExecutiveStatus = (id: string, isActive: boolean) =>
  a<Executive>(`/admin/executives/${enc(id)}/status`, { method: "PATCH", body: { isActive } });

export const assignExecutiveTeam = (id: string, teamId: string) =>
  a<Executive>(`/admin/executives/${enc(id)}/team`, { method: "PATCH", body: { teamId } });

export const removeExecutiveTeam = (id: string) =>
  a<Executive>(`/admin/executives/${enc(id)}/team`, { method: "DELETE" });

export const deleteExecutive = (id: string) => a<unknown>(`/admin/executives/${enc(id)}`, { method: "DELETE" });

// ---- Properties ----

export type PropertyFilters = { assigned?: string; isActive?: string; search?: string };
export type PropertyChanges = { name?: string; description?: string | null; location?: string | null };

export const listProperties = (filters: PropertyFilters = {}) => a<Property[]>("/admin/properties", { query: filters });

export const getProperty = cache((id: string) => a<PropertyDetail>(`/admin/properties/${enc(id)}`));

export const updateProperty = (id: string, body: PropertyChanges) =>
  a<Property>(`/admin/properties/${enc(id)}`, { method: "PATCH", body });

export const setPropertyStatus = (id: string, isActive: boolean) =>
  a<Property>(`/admin/properties/${enc(id)}/status`, { method: "PATCH", body: { isActive } });

export const setPropertyExecutives = (id: string, executiveIds: string[]) =>
  a<PropertyDetail & { assignedPendingLeads: number }>(`/admin/properties/${enc(id)}/executives`, {
    method: "PUT",
    body: { executiveIds },
  });

// ---- Leads ----

export type LeadFilters = {
  important?: string;
  status?: string;
  propertyId?: string;
  executiveId?: string;
  search?: string;
  limit?: string;
  offset?: string;
};

export type NewLead = {
  name: string;
  mobile: string;
  email?: string;
  propertyName: string;
  source: string;
  requirement?: string;
  enquiryType?: string;
  budget?: number;
  message?: string;
  /** Manager only: the executive who gets the lead. */
  executiveId?: string;
};

export const listLeads = (filters: LeadFilters = {}) => a<Lead[]>("/admin/leads", { query: filters });

export const getLead = cache((id: string) => a<LeadDetail>(`/admin/leads/${enc(id)}`));

export const createLead = (body: NewLead) => a<Lead>("/admin/leads", { method: "POST", body });

export const setLeadStatus = (id: string, status: string) =>
  a<Lead>(`/admin/leads/${enc(id)}/status`, { method: "PATCH", body: { status } });

// ---- Clients ----

export const listCustomers = (filters: { search?: string; limit?: string; offset?: string } = {}) =>
  a<Customer[]>("/admin/customers", { query: filters });

export const getCustomer = cache((id: string) => a<CustomerDetail>(`/admin/customers/${enc(id)}`));

export const updateCustomer = (id: string, body: { name?: string; email?: string | null }) =>
  a<Customer>(`/admin/customers/${enc(id)}`, { method: "PATCH", body });

// ---- Managers ----

export type NewManager = { name: string; email: string; username: string; password: string; phone: string | null };
export type ManagerChanges = Partial<Pick<Manager, "name" | "email" | "username" | "phone">>;

export const listManagers = (filters: { isActive?: string; search?: string } = {}) =>
  a<Manager[]>("/admin/managers", { query: filters });

export const getManager = cache((id: string) => a<ManagerDetail>(`/admin/managers/${enc(id)}`));

export const createManager = (body: NewManager) => a<Manager>("/admin/managers", { method: "POST", body });

export const updateManager = (id: string, body: ManagerChanges) =>
  a<Manager>(`/admin/managers/${enc(id)}`, { method: "PATCH", body });

export const resetManagerPassword = (id: string, password: string) =>
  a<unknown>(`/admin/managers/${enc(id)}/password`, { method: "PATCH", body: { password } });

export const setManagerStatus = (id: string, isActive: boolean) =>
  a<Manager>(`/admin/managers/${enc(id)}/status`, { method: "PATCH", body: { isActive } });

export const deleteManager = (id: string) => a<unknown>(`/admin/managers/${enc(id)}`, { method: "DELETE" });

// ---- Lead assignment ----

export const assignLeadAsAdmin = (id: string, executiveId: string) =>
  a<Lead>(`/admin/leads/${enc(id)}/assign`, { method: "PATCH", body: { executiveId } });

// ---- Settings ----

export const getAssignmentRule = () => a<AssignmentRuleSetting>("/admin/settings/assignment-rule");

export const setAssignmentRule = (rule: string) =>
  a<AssignmentRuleSetting>("/admin/settings/assignment-rule", { method: "PUT", body: { rule } });

export const getLeadTimeout = () => a<LeadTimeoutSetting>("/admin/settings/lead-timeout");

export const setLeadTimeout = (minutes: number) =>
  a<LeadTimeoutSetting>("/admin/settings/lead-timeout", { method: "PUT", body: { minutes } });

/** The API wraps the rows as `{ property, limit, offset, history }`. */
export async function listAssignmentHistory(propertyId: string, filters: { limit?: string; offset?: string } = {}) {
  const res = await a<{ history: AssignmentHistoryEntry[] } | AssignmentHistoryEntry[]>(`/admin/properties/${enc(propertyId)}/assignment-history`, { query: filters });
  return Array.isArray(res) ? res : (res.history ?? []);
}
