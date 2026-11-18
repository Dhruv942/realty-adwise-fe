import "server-only";
import { authedRequest } from "./api";
import type { LeadStatus, LeadSource, Role } from "./types";
import { buildReportQuery, reportPath } from "@/components/reports/report-format";
export { buildReportQuery, reportPath } from "@/components/reports/report-format";

export const REPORT_SECTIONS = ["overview", "leads", "executives", "managers", "sources", "properties", "transactions", "follow-ups"] as const;
export type ReportSection = (typeof REPORT_SECTIONS)[number];
export const EXECUTIVE_REPORT_SECTIONS: ReportSection[] = ["overview", "leads", "follow-ups"];
export type ReportFormat = "json" | "csv" | "excel";

export type ReportFilters = {
  fromDate?: string;
  toDate?: string;
  managerId?: string;
  executiveId?: string;
  source?: LeadSource | string;
  status?: LeadStatus | string;
  projectId?: string;
  propertyId?: string;
  transactionType?: "RENT_LEASE" | "SALE_PURCHASE" | string;
  propertyCategory?: "RESIDENTIAL" | "COMMERCIAL" | string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  priceBand?: string;
  tz?: string;
  limit?: number;
  offset?: number;
  format?: ReportFormat;
};

export type Breakdown = { key: string; label: string; count: number };
export type ReportMeta = { appliedFilters?: ReportFilters; timezone?: string; generatedAt?: string; pagination?: { limit: number; offset: number; returned: number } };
export type ReportEnvelope<T> = { data: T; meta: ReportMeta };
export type ReportSummary = { total: number; assigned: number; unassigned: number; newLeads: number };
export type OverviewData = { summary: ReportSummary; breakdowns: { byStatus?: Breakdown[]; bySource?: Breakdown[]; byExecutive?: Breakdown[]; byManager?: Breakdown[]; byProject?: Breakdown[]; byProperty?: Breakdown[]; byTransactionType?: Breakdown[]; byPropertyCategory?: Breakdown[]; byLocation?: Breakdown[]; byPriceBand?: Breakdown[] } };
export type LeadReportRow = { leadNo: number; leadId: string; createdAt: string; status: string; source: string; assignedExecutiveName: string | null; managerName: string | null; projectName: string | null; propertyName: string | null; transactionType: string | null; propertyCategory: string | null; location: string | null; priceBand: string | null; followUpAt: string | null };
export type LeadsData = { summary: ReportSummary; rows: LeadReportRow[] };
export type ExecutiveReportRow = { executiveId: string; executiveName: string; managerId: string | null; currentLeads: number; assignedDuringPeriod: number; reassignmentCount: number; pendingFollowUps: number };
export type ManagerReportRow = { managerId: string; managerName: string; currentLeads: number; activeExecutives: number };
export type PropertyReportRow = { propertyId: string; propertyName: string; projectId: string | null; projectName: string | null; leads: number; inventoryCount: number; availableInventoryCount: number };
export type FollowUpSummary = { due: number; overdue: number; pending: number; completed: number | null; completedAvailable: boolean };
export type FollowUpsData = { summary: FollowUpSummary; rows?: LeadReportRow[] };
export type BreakdownData = { bySource?: Breakdown[]; byStatus?: Breakdown[]; byTransactionType?: Breakdown[]; byPropertyCategory?: Breakdown[]; byLocation?: Breakdown[]; byPriceBand?: Breakdown[] };
export type PropertiesData = { rows: PropertyReportRow[] };

export async function fetchReport<T>(role: Role, section: ReportSection, filters: ReportFilters = {}): Promise<ReportEnvelope<T>> {
  return authedRequest<ReportEnvelope<T>>(role, reportPath(role, section), { query: Object.fromEntries(buildReportQuery(filters).entries()) });
}
