import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listManagers } from "@/lib/admin";

export const metadata: Metadata = { title: "Managers" };

type SearchParams = Promise<{ search?: string; isActive?: string; deleted?: string }>;

export default async function ManagersPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", isActive = "", deleted } = await searchParams;
  const status = isActive === "true" || isActive === "false" ? isActive : "";
  const managers = await listManagers({ search: search.trim() || undefined, isActive: status || undefined });
  const filtered = Boolean(search || status);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Managers</h1>
        </div>
        <Link className="btn btn-solid" href="/admin/managers/new">
          New manager
        </Link>
      </div>

      {deleted && (
        <p className="notice notice-success" role="status">
          Manager deleted.
        </p>
      )}

      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={search} placeholder="Name, email or username" />
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
          <Link className="btn btn-line" href="/admin/managers">
            Clear
          </Link>
        )}
      </form>

      <p className="muted result-count">
        {managers.length} {managers.length === 1 ? "manager" : "managers"}
        {filtered ? " found" : ""}
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col" className="hidden md:table-cell">Email</th>
              <th scope="col" className="hidden lg:table-cell">Phone</th>
              <th scope="col">Status</th>
              <th scope="col" className="col-actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="person">
                    <span className="avatar" aria-hidden="true">
                      {m.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")}
                    </span>
                    <div className="min-w-0">
                      <Link className="person-name" href={`/admin/managers/${m.id}`}>
                        {m.name}
                      </Link>
                      <div className="muted person-sub">@{m.username}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">{m.email}</td>
                <td className="hidden lg:table-cell">{m.phone ?? <span className="muted">—</span>}</td>
                <td>
                  <StatusBadge active={m.isActive} />
                </td>
                <td className="col-actions">
                  <Link className="btn btn-line btn-sm" href={`/admin/managers/${m.id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {managers.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  {filtered ? (
                    <>
                      <strong>No managers match these filters</strong>
                      <Link href="/admin/managers">Clear the filters</Link> to see everyone.
                    </>
                  ) : (
                    <>
                      <strong>No managers yet</strong>
                      <Link href="/admin/managers/new">Create the first manager</Link>, then make them the manager of a team.
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
