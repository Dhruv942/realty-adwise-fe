import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
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
          <p className="eyebrow">Admin</p>
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

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Team</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {executives.map((exec) => (
              <tr key={exec.id}>
                <td>
                  <Link href={`/admin/executives/${exec.id}`}>{exec.name}</Link>
                  <div className="muted">@{exec.username}</div>
                </td>
                <td>{exec.email}</td>
                <td>{exec.phone ?? <span className="muted">—</span>}</td>
                <td>{exec.team ? <Link href={`/admin/teams/${exec.team.id}`}>{exec.team.name}</Link> : <span className="muted">No team</span>}</td>
                <td>
                  <StatusBadge active={exec.isActive} />
                </td>
              </tr>
            ))}
            {executives.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  {filtered ? "No executives match these filters." : "No executives yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
