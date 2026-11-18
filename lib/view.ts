import "server-only";
import { authedRequest } from "./api";
import type { Executive, Lead, LeadStatus, LeadSummary, Manager } from "./types";

/**
 * Read-only "view as" dashboards. The session keeps its own role (admin or manager); the backend decides which
 * other user's data it may show and answers 404 for anything out of scope.
 */
type Viewer = "ADMIN" | "MANAGER";
const v = <T>(role: Viewer, path: string, query?: Record<string, string | undefined>) => authedRequest<T>(role, `/view${path}`, { query });

export type ExecutiveDashboard = {
  readOnly: true;
  viewing: { role: "SALES"; user: Executive };
  summary: LeadSummary;
  recentLeads: Lead[];
};

export type ManagerDashboard = {
  readOnly: true;
  viewing: { role: "MANAGER"; user: Manager };
  executives: Executive[];
  summary: { totalLeads: number; pendingLeads: number; byStatus: Partial<Record<LeadStatus, number>> };
  recentLeads: Lead[];
};

export const listViewableExecutives = (role: Viewer, managerId?: string) => v<Executive[]>(role, "/executives", { managerId });
export const listViewableManagers = () => v<Manager[]>("ADMIN", "/managers");
export const getExecutiveDashboard = (role: Viewer, id: string) => v<ExecutiveDashboard>(role, `/executives/${encodeURIComponent(id)}/dashboard`);
export const getManagerDashboard = (id: string) => v<ManagerDashboard>("ADMIN", `/managers/${encodeURIComponent(id)}/dashboard`);
