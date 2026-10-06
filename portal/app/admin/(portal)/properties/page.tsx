import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listProperties } from "@/lib/admin";

export const metadata: Metadata = { title: "Properties" };

type SearchParams = Promise<{ search?: string; isActive?: string; assigned?: string }>;

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", isActive = "", assigned = "" } = await searchParams;
  const status = isActive === "true" || isActive === "false" ? isActive : "";
  const needs = assigned === "false" ? "false" : "";
  const properties = await listProperties({ search: search.trim() || undefined, isActive: status || undefined, assigned: needs || undefined });
  const filtered = Boolean(search || status || needs);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Properties</h1>
        </div>
        <Link className="btn btn-line" href="/admin/properties?assigned=false">
          Needing assignment
        </Link>
      </div>

      <p className="muted">Properties are created automatically from leads. Open one to choose its executives.</p>

      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={search} placeholder="Property name" />
        </div>
        <div className="field">
          <label htmlFor="assigned">Executives</label>
          <select id="assigned" name="assigned" defaultValue={needs}>
            <option value="">All</option>
            <option value="false">Needs executives</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="isActive" defaultValue={status}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <button className="btn btn-line" type="submit">
          Filter
        </button>
        {filtered && (
          <Link className="btn btn-line" href="/admin/properties">
            Clear
          </Link>
        )}
      </form>

      <p className="muted result-count">
        {properties.length} {properties.length === 1 ? "property" : "properties"}
        {filtered ? " found" : ""}
      </p>

      <div className="table-wrap table-exec">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Executives</th>
              <th>Pending leads</th>
              <th>Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link className="person-name" href={`/admin/properties/${p.id}`}>
                    {p.name}
                  </Link>
                  {p.isStub && <div className="muted person-sub">Created from a lead, details not filled in</div>}
                </td>
                <td>{p.location ?? <span className="muted">—</span>}</td>
                <td>
                  {p.needsAssignment ? <span className="badge badge-warn">Needs executives</span> : p.assignedExecutiveCount}
                </td>
                <td>{p.pendingLeadCount > 0 ? <strong>{p.pendingLeadCount}</strong> : <span className="muted">0</span>}</td>
                <td>
                  <StatusBadge active={p.isActive} />
                </td>
                <td className="col-actions">
                  <Link className="btn btn-line btn-sm" href={`/admin/properties/${p.id}`}>
                    {p.needsAssignment ? "Assign executives" : "Manage"}
                  </Link>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  {filtered ? "No properties match these filters." : "No properties yet. They appear when the first lead is added."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
