import "server-only";
import { cache } from "react";
import { authedRequest } from "./api";
import type { Executive, Team, TeamDetail } from "./types";

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
