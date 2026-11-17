import type { Metadata } from "next";
import { ReportsWorkspace } from "@/components/reports/ReportsWorkspace";
import { reportFiltersFromParams } from "@/components/reports/report-format";
import { ApiError } from "@/lib/api";
import { fetchReport, type ReportSection } from "@/lib/reports";
import { listManagerExecutives } from "@/lib/manager";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Reports" };
const sections = new Set<ReportSection>(["overview", "leads", "executives", "managers", "sources", "properties", "transactions", "follow-ups"]);

export default async function ManagerReports({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireSession("MANAGER");
  const params = await searchParams;
  const section = sections.has(params.section as ReportSection) ? params.section as ReportSection : "overview";
  const filters = { ...reportFiltersFromParams(params), limit: Number(params.limit) || 100, offset: Number(params.offset) || 0 };
  const [report, executives] = await Promise.all([
    fetchReport("MANAGER", section, filters).catch((error: unknown) => ({ error: error instanceof ApiError ? error.message : "Unable to load this report. Try again." })),
    listManagerExecutives(),
  ]);
  return <ReportsWorkspace role="MANAGER" section={section} filters={filters} data={"data" in report ? report.data : undefined} error={"error" in report ? report.error : undefined} executives={executives.map((e) => ({ id: e.id, name: e.name }))} />;
}
