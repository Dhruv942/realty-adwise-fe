import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { TeamForm } from "@/components/TeamForm";
import { createTeamAction } from "@/lib/actions/teams";
import { listManagers, listTeams } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Teams" };

type SearchParams = Promise<{ search?: string; isActive?: string }>;

export default async function TeamsPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", isActive = "" } = await searchParams;
  const status = isActive === "true" || isActive === "false" ? isActive : "";
  const [teams, managers] = await Promise.all([listTeams({ search: search.trim() || undefined, isActive: status || undefined }), listManagers()]);
  const filtered = Boolean(search || status);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Teams</h1>
        </div>
      </div>

      <div className="cols">
        <section className="stack" aria-label="Team list">
          <form className="filters" method="get" role="search">
            <div className="field">
              <label htmlFor="q">Search</label>
              <input id="q" name="search" type="search" defaultValue={search} placeholder="Team name" />
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
              <Link className="btn btn-line" href="/admin/teams">
                Clear
              </Link>
            )}
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Manager</th>
                  <th>Executives</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <Link href={`/admin/teams/${team.id}`}>{team.name}</Link>
                      {team.description && <div className="muted">{team.description}</div>}
                    </td>
                    <td>{team.manager?.name ?? <span className="muted">None</span>}</td>
                    <td>{team.executiveCount}</td>
                    <td>
                      <StatusBadge active={team.isActive} />
                    </td>
                    <td className="muted">{formatDate(team.createdAt)}</td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">
                      {filtered ? "No teams match these filters." : "No teams yet. Create the first one."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel" id="new" aria-labelledby="new-team">
          <h2 id="new-team">New team</h2>
          <TeamForm action={createTeamAction} managers={managers} submitLabel="Create team" />
        </section>
      </div>
    </>
  );
}
