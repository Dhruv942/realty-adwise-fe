import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReportQuery, reportPath } from "../components/reports/report-format.ts";
import type { ReportFilters } from "../lib/reports.ts";

describe("report query helpers", () => {
  it("serializes supported filters and defaults Indian calendar timezone", () => {
    const filters: ReportFilters = {
      fromDate: "2026-11-01",
      toDate: "2026-11-30",
      source: "99ACRES",
      status: "INCOMING",
      minPrice: "1000000",
      maxPrice: "4000000",
      location: "Thane",
      limit: 50,
      offset: 100,
    };
    assert.equal(buildReportQuery(filters).toString(), "fromDate=2026-11-01&toDate=2026-11-30&source=99ACRES&status=INCOMING&location=Thane&minPrice=1000000&maxPrice=4000000&tz=Asia%2FKolkata&limit=50&offset=100");
  });

  it("omits empty filters and preserves an explicit timezone", () => {
    assert.equal(buildReportQuery({ tz: "UTC", limit: 100, offset: 0 }).toString(), "tz=UTC&limit=100&offset=0");
  });

  it("maps report sections to role-prefixed backend paths", () => {
    assert.equal(reportPath("ADMIN", "overview"), "/admin/reports/overview");
    assert.equal(reportPath("MANAGER", "follow-ups"), "/manager/reports/follow-ups");
    assert.equal(reportPath("EXECUTIVE", "leads"), "/executive/reports/leads");
  });
});
