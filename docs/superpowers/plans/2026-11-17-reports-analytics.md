# Reports & Analytics Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared, role-scoped Reports workspace backed by the implemented Reports, Analytics, and Export APIs.

**Architecture:** Add typed report API helpers and a shared server-rendered workspace. Role pages supply the correct role and lookup data; a same-origin export route streams CSV/Excel with the httpOnly session token.

**Tech Stack:** Next.js App Router, React 19, TypeScript, existing Tailwind utility classes, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-17-reports-analytics-design.md`

## Global Constraints

- Use `Asia/Kolkata` as the default UI timezone for Indian users.
- Do not expose customer phone/email in reports.
- Do not add team filters or team columns.
- Do not recreate price-band calculations in the frontend.
- Show completed follow-up metrics as unavailable when `completedAvailable` is false.
- Backend scope is authoritative; frontend filters must not broaden access.

## Review Focus

- Date and price validation errors preserve entered filters and show field-level messages.
- Executive pages do not render manager/executive scope selectors.
- Empty arrays render a useful empty state while preserving filters.
- CSV/Excel export forwards the exact active filters and never exposes the token.
- `completedAvailable: false` is rendered as “Not available”, never `0`.

### Task 1: Typed report API and query model

**Files:**
- Create: `portal/lib/reports.ts`
- Modify: `portal/lib/api.ts` if a raw authenticated response helper is needed
- Modify: `portal/lib/types.ts` only for shared enum reuse if needed
- Test: `portal/tests/reports.test.ts`

**Interfaces:**
- Produces `ReportFilters`, `ReportSection`, response types, `buildReportQuery(filters)`, `reportPath(role, section)`, and role-aware report fetchers.

- [ ] Write tests for query omission, `tz=Asia/Kolkata` default, pagination, section paths, and `completedAvailable: false` typing.
- [ ] Run the focused test and verify it fails because the report module is missing.
- [ ] Implement typed helpers for overview, leads, executives, managers, sources, properties, transactions, and follow-ups using `authedRequest`.
- [ ] Run focused tests and then typecheck.

### Task 2: Authenticated export route

**Files:**
- Create: `portal/app/api/reports/export/route.ts`
- Modify: `portal/lib/api.ts` if the route needs a shared raw backend request helper
- Test: `portal/tests/reports-export.test.ts`

**Interfaces:**
- Consumes `ReportFilters` serialization and the logged-in session.
- Produces `GET /api/reports/export` with `format=csv|excel`, role-derived backend path, forwarded filters, and attachment headers.

- [ ] Write tests for role-derived forwarding, unsupported format rejection, and absence of client-visible token handling.
- [ ] Run focused tests and verify failure.
- [ ] Implement session validation, backend fetch, 401/403/400 passthrough, and streamed content disposition.
- [ ] Run focused tests and typecheck.

### Task 3: Shared Reports workspace

**Files:**
- Create: `portal/components/reports/ReportsWorkspace.tsx`
- Create: `portal/components/reports/ReportFilters.tsx`
- Create: `portal/components/reports/report-format.ts`
- Test: `portal/tests/reports-format.test.ts`

**Interfaces:**
- Consumes normalized report data, role, section, URL filters, and lookup options.
- Produces accessible tabs, filter form, summary cards, breakdowns, performance tables, lead table with pagination, follow-up unavailable state, and CSV/Excel buttons.

- [ ] Write format tests for labels, empty states, unavailable follow-up metrics, and export URL construction.
- [ ] Run focused tests and verify failure.
- [ ] Implement the workspace with shared filter controls, compact accessible data views, and role-specific section visibility.
- [ ] Run focused tests and typecheck.

### Task 4: Role pages and navigation

**Files:**
- Create: `portal/app/admin/(portal)/reports/page.tsx`
- Create: `portal/app/manager/(portal)/reports/page.tsx`
- Create: `portal/app/executive/(portal)/reports/page.tsx`
- Modify: `portal/components/shell/nav.ts`
- Modify: `portal/components/PortalShell.tsx` only if required by page data flow

**Interfaces:**
- Role pages require the current role, load permitted lookup options, fetch the selected report section, and render `ReportsWorkspace`.

- [ ] Add Reports navigation and verify role-specific visibility.
- [ ] Implement admin/manager/executive loaders with URL filter parsing and pagination reset semantics.
- [ ] Run typecheck and the full test suite.

### Task 5: Verification and polish

**Files:**
- Modify any report files needed by verification.

- [ ] Run `npm test` from `portal`.
- [ ] Run `npm run typecheck` from `portal`.
- [ ] Run `npm run build` from `portal`.
- [ ] Review changed files for customer contact leakage, unsupported source filters, and no-data behavior.
