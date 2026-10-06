import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { StatusBadge } from "@/components/StatusBadge";
import { TeamForm } from "@/components/TeamForm";
import { setTeamStatusAction, updateTeamAction } from "@/lib/actions/teams";
import { getTeam, listManagers } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

async function loadTeam(id: string) {
  try {
    return await getTeam(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const team = await loadTeam(id);
  return { title: team.name };
}

export default async function TeamPage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [team, managers] = await Promise.all([loadTeam(id), listManagers()]);

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/teams">
            ← Teams
          </Link>
          <h1>{team.name}</h1>
        </div>
        <StatusBadge active={team.isActive} />
      </div>

      {created && (
        <p className="notice notice-success" role="status">
          Team created. You can now add executives to it.
        </p>
      )}

      <div className="cols">
        <section className="stack">
          <div className="panel-head">
            <h2>Executives</h2>
            {team.isActive && (
              <Link className="btn btn-line" href={`/admin/executives/new?teamId=${team.id}`}>
                New executive
              </Link>
            )}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.executives.map((exec) => (
                  <tr key={exec.id}>
                    <td>
                      <Link href={`/admin/executives/${exec.id}`}>{exec.name}</Link>
                      <div className="muted">@{exec.username}</div>
                    </td>
                    <td>{exec.email}</td>
                    <td>
                      <StatusBadge active={exec.isActive} />
                    </td>
                  </tr>
                ))}
                {team.executives.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty">
                      No executives in this team yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="side">
          <section className="panel">
            <h2>Details</h2>
            <dl className="meta">
              <dt>Manager</dt>
              <dd>{team.manager ? <Link href={`/admin/managers/${team.manager.id}`}>{team.manager.name}</Link> : "None"}</dd>
              <dt>Active executives</dt>
              <dd>{team.executiveCount}</dd>
              <dt>Created</dt>
              <dd>{formatDate(team.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(team.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Edit team</h2>
            <TeamForm action={updateTeamAction.bind(null, team.id)} team={team} managers={managers} submitLabel="Save changes" />
          </section>

          <section className="panel">
            <h2>Status</h2>
            <p className="muted">
              {team.isActive
                ? "Deactivating stops new executives from joining this team. Teams can't be deleted."
                : "This team is inactive. Executives can't be added until it's activated."}
            </p>
            <ActionForm
              action={setTeamStatusAction.bind(null, team.id, !team.isActive)}
              label={team.isActive ? "Deactivate team" : "Activate team"}
              pendingLabel="Updating…"
              variant={team.isActive ? "danger" : "solid"}
              confirm={team.isActive ? `Deactivate ${team.name}?` : undefined}
            />
          </section>
        </div>
      </div>
    </>
  );
}
