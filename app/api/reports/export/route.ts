import { NextRequest } from "next/server";
import { authedRawRequest } from "@/lib/api";
import { buildReportQuery } from "@/components/reports/report-format";
import type { ReportFilters } from "@/lib/reports";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ success: false, message: "Authentication required" }, { status: 401 });
  const input = Object.fromEntries(request.nextUrl.searchParams.entries());
  const format = input.format === "excel" ? "excel" : input.format === "csv" ? "csv" : null;
  if (!format) return Response.json({ success: false, message: "format must be csv or excel" }, { status: 400 });
  const filters: ReportFilters = { ...input, format };
  delete filters.format;
  const backend = await authedRawRequest(session.user.role, `/${session.user.role.toLowerCase()}/reports/leads`, Object.fromEntries(buildReportQuery({ ...filters, format }).entries()));
  if (!backend.ok) return new Response(await backend.text(), { status: backend.status, headers: { "Content-Type": backend.headers.get("content-type") ?? "application/json" } });
  const headers = new Headers();
  headers.set("Content-Type", backend.headers.get("content-type") ?? (format === "csv" ? "text/csv; charset=utf-8" : "application/vnd.ms-excel; charset=utf-8"));
  headers.set("Content-Disposition", backend.headers.get("content-disposition") ?? `attachment; filename="realtyadwise-report.${format === "csv" ? "csv" : "xls"}"`);
  return new Response(backend.body, { status: backend.status, headers });
}
