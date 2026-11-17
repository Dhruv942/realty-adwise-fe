import type { ReportFilters, ReportSection } from "../../lib/reports";
import type { Role } from "../../lib/types";

export const REPORT_SECTIONS = ["overview", "leads", "executives", "managers", "sources", "properties", "transactions", "follow-ups"] as const;
export const EXECUTIVE_REPORT_SECTIONS = ["overview", "leads", "follow-ups"] as const;

const FILTER_ORDER: (keyof ReportFilters)[] = ["fromDate", "toDate", "managerId", "executiveId", "source", "status", "projectId", "propertyId", "transactionType", "propertyCategory", "location", "minPrice", "maxPrice", "priceBand"];

export function buildReportQuery(filters: ReportFilters = {}): URLSearchParams {
  const query = new URLSearchParams();
  for (const key of FILTER_ORDER) {
    const value = filters[key];
    if (value !== undefined && String(value) !== "") query.set(key, String(value));
  }
  query.set("tz", filters.tz || "Asia/Kolkata");
  for (const key of ["limit", "offset", "format"] as const) {
    const value = filters[key];
    if (value !== undefined && String(value) !== "") query.set(key, String(value));
  }
  return query;
}

export function reportPath(role: Role, section: ReportSection): string {
  return `/${role.toLowerCase()}/reports/${section}`;
}

export function exportUrl(filters: ReportFilters, format: "csv" | "excel"): string {
  const query = buildReportQuery({ ...filters, format });
  return `/api/reports/export?${query.toString()}`;
}

export function reportFiltersFromParams(params: Record<string, string | undefined>): ReportFilters {
  const filters: ReportFilters = {};
  for (const key of ["fromDate", "toDate", "managerId", "executiveId", "source", "status", "projectId", "propertyId", "transactionType", "propertyCategory", "location", "minPrice", "maxPrice", "priceBand", "tz"] as const) {
    if (params[key]) filters[key] = params[key];
  }
  if (params.limit && Number.isFinite(Number(params.limit))) filters.limit = Number(params.limit);
  if (params.offset && Number.isFinite(Number(params.offset))) filters.offset = Number(params.offset);
  return filters;
}
