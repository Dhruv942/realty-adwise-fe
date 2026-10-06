import "server-only";
import { cache } from "react";
import { authedRequest } from "./api";
import type { Customer, CustomerDetail, Executive, Lead, LeadDetail, Property, PropertyDetail, Team, TeamDetail } from "./types";

const a = <T>(path: string, options?: Parameters<typeof authedRequest>[2]) => authedRequest<T>("ADMIN", path, options);
const enc = encodeURIComponent;

// ---- Teams ----

export type TeamFilters = { isActive?: string; search?: string };

export const listTeams = (filters: TeamFilters = {}) => a<Team[]>("/admin/teams", { query: filters });

// cache() dedupes the call when generateMetadata and the page both need the record.
export const getTeam = cache((id: string) => a<TeamDetail>(`/admin/teams/${enc(id)}`));

export const createTeam = (body: { name: string; description: string | null }) =>
  a<Team>("/admin/teams", { method: "POST", body });

export const updateTeam = (id: string, body: { name?: string; description?: string | null }) =>
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
};

export type ExecutiveChanges = Partial<Pick<Executive, "name" | "email" | "username" | "phone">>;

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
  customerType?: string;
  budget?: number;
  message?: string;
  externalLeadId?: string;
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
