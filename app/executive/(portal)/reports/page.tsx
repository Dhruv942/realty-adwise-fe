import type { Metadata } from "next";
import { ReportsWorkspace } from "@/components/reports/ReportsWorkspace";
import { reportFiltersFromParams } from "@/components/reports/report-format";
import { ApiError } from "@/lib/api";
import { fetchReport, type ReportSection } from "@/lib/reports";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Reports" };
const sections = new Set<ReportSection>(["overview", "leads", "follow-ups"]);

export default async function ExecutiveReports({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSession("EXECUTIVE");
  const params = await searchParams;
  const section = sections.has(params.section as ReportSection) ? params.section as ReportSection : "overview";
  const filters = { ...reportFiltersFromParams(params), limit: Number(params.limit) || 100, offset: Number(params.offset) || 0 };
  const report = await fetchReport("EXECUTIVE", section, filters).catch((error: unknown) => ({ error: error instanceof ApiError ? error.message : "Unable to load this report. Try again." }));
  return <ReportsWorkspace role="EXECUTIVE" section={section} filters={filters} data={"data" in report ? report.data : undefined} error={"error" in report ? report.error : undefined} />;
}
