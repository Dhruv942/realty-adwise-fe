# RealtyAdwise Reports & Analytics Design

## Intent

Add the Reports workspace to all three portals so users can inspect the report data already implemented by the backend, apply calendar-safe filters, paginate lead rows, and export filtered lead reports. Admins and managers get all report sections; executives get Overview, Leads, and Follow-ups.

## Goals

- Add Reports navigation for Admin, Manager, and Executive roles.
- Keep one shared filter model using `tz=Asia/Kolkata` by default.
- Render summary cards, breakdowns, performance tables, lead rows, and follow-up availability accurately.
- Preserve filters in the URL and reset lead pagination when filters change.
- Export through an authenticated same-origin route without exposing the access token to browser JavaScript.
- Handle backend error envelopes, 401/403/400 responses, empty results, and `completedAvailable: false`.

## Non-goals

- Teams, bulk reassignment, configurable statuses, conversion rate, or historical status-at-a-date.
- Frontend-calculated price bands, scope expansion, or customer phone/email in report rows or exports.
- Native `.xlsx` generation; Excel export remains the backend's tab-separated `.xls` response.

## Constraints

- Use the existing Next.js App Router and server-side `authedRequest` conventions.
- Backend report routes are role-prefixed (`/admin`, `/manager`, `/executive`).
- Admin-only `managerId`, Admin/Manager `executiveId`, and all other filters are forwarded exactly as supported by the API; the backend remains authoritative for access scope.
- Indian calendar date selections send `tz=Asia/Kolkata` and inclusive `fromDate`/`toDate` values.

## Approaches

1. Separate page per report: straightforward URLs, but duplicates filter, error, export, and loading behavior.
2. Shared tabbed Reports workspace (chosen): one reusable filter bar and URL state, with role-aware server loaders and section renderers. This matches the existing role-prefixed server architecture and keeps the contract consistent.

## Design

`lib/reports.ts` defines report query types, response types, role-aware fetchers, and filter serialization. `components/reports/ReportsWorkspace.tsx` renders tabs, filters, cards, breakdown tables, lead tables, pagination, and export controls from server-provided data. Each role gets a thin `reports/page.tsx` loader that requires its role and calls the shared loader. A same-origin `/api/reports/export` route authenticates the session, validates the requested format, forwards filters to the role-specific backend endpoint, and streams the backend attachment.

The UI uses plain tables and compact breakdown lists rather than introducing a chart dependency. This keeps the existing visual language, provides accessible labels, and gives useful behavior for empty arrays without pretending unavailable metrics are zero.

## Open builder calls

- Use URL query parameters for section, filters, and offset; server-render the selected section.
- Use native date inputs and select controls; location submits with Apply rather than adding a new debounce dependency.
- Load managers, executives, and properties from existing admin/manager APIs where available; executives see no scope-expanding selector.
