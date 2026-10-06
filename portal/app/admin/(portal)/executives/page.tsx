import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteExecutiveAction } from "@/lib/actions/executives";
import { listExecutives, listTeams } from "@/lib/admin";

export const metadata: Metadata = { title: "Executives" };

type SearchParams = Promise<{ search?: string; isActive?: string; teamId?: string; deleted?: string }>;

export default async function ExecutivesPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", isActive = "", teamId = "", deleted } = await searchParams;
  const status = isActive === "true" || isActive === "false" ? isActive : "";
  const [executives, teams] = await Promise.all([
    listExecutives({ search: search.trim() || undefined, isActive: status || undefined, teamId: teamId || undefined }),
    listTeams(),
  ]);
  const filtered = Boolean(search || status || teamId);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Executives</h1>
        </div>
        <Link className="btn btn-solid" href="/admin/executives/new">
          New executive
        </Link>
      </div>

      {deleted && (
        <p className="notice notice-success" role="status">
          Executive deleted.
        </p>
      )}

      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={search} placeholder="Name, email or username" />
        </div>
        <div className="field">
          <label htmlFor="team">Team</label>
          <select id="team" name="teamId" defaultValue={teamId}>
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
                {team.isActive ? "" : " (inactive)"}
              </option>
            ))}
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
          <Link className="btn btn-line" href="/admin/executives">
            Clear
          </Link>
        )}
      </form>

      <p className="muted result-count">
        {executives.length} {executives.length === 1 ? "executive" : "executives"}
        {filtered ? " found" : ""}
      </p>

      <div className="table-wrap table-exec">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th className="hidden md:table-cell">Email</th>
              <th className="hidden lg:table-cell">Phone</th>
              <th className="hidden sm:table-cell">Team</th>
              <th>Status</th>
              <th className="col-actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {executives.map((exec) => (
              <tr key={exec.id}>
                <td>
                  <div className="person">
                    <span className="avatar" aria-hidden="true">
                      {exec.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")}
                    </span>
                    <div>
                      <Link className="person-name" href={`/admin/executives/${exec.id}`}>{exec.name}</Link>
                      <div className="muted person-sub">@{exec.username}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">{exec.email}</td>
                <td className="hidden lg:table-cell">{exec.phone ?? <span className="muted">—</span>}</td>
                <td className="hidden sm:table-cell">{exec.team ? <Link href={`/admin/teams/${exec.team.id}`}>{exec.team.name}</Link> : <span className="muted">No team</span>}</td>
                <td>
                  <StatusBadge active={exec.isActive} />
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link className="btn btn-line btn-sm" href={`/admin/executives/${exec.id}`}>
                      Edit
                    </Link>
                    <ActionForm
                      action={deleteExecutiveAction.bind(null, exec.id)}
                      label="Delete"
                      pendingLabel="Deleting…"
                      variant="danger"
                      size="sm"
                      confirm={`Delete ${exec.name}? They will be deactivated and hidden from lists.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {executives.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  {filtered ? (
                    <>
                      <strong>No executives match these filters</strong>
                      <Link href="/admin/executives">Clear the filters</Link> to see everyone.
                    </>
                  ) : (
                    <>
                      <strong>No executives yet</strong>
                      <Link href="/admin/executives/new">Add the first executive</Link> so leads can be assigned.
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
