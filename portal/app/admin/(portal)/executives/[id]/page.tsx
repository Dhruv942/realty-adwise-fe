import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { AssignTeamForm, EditExecutiveForm, ResetPasswordForm } from "@/components/ExecutiveForms";
import { StatusBadge } from "@/components/StatusBadge";
import {
  assignTeamAction,
  deleteExecutiveAction,
  removeTeamAction,
  resetPasswordAction,
  setExecutiveStatusAction,
  updateExecutiveAction,
} from "@/lib/actions/executives";
import { getExecutive, listTeams } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

async function loadExecutive(id: string) {
  try {
    return await getExecutive(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const executive = await loadExecutive(id);
  return { title: executive.name };
}

export default async function ExecutivePage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [executive, activeTeams] = await Promise.all([loadExecutive(id), listTeams({ isActive: "true" })]);
  const otherTeams = activeTeams.filter((t) => t.id !== executive.team?.id);

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/executives">
            ← Executives
          </Link>
          <h1>{executive.name}</h1>
          <p className="muted">@{executive.username}</p>
        </div>
        <StatusBadge active={executive.isActive} />
      </div>

      {created && (
        <p className="notice notice-success" role="status">
          Executive created. They can now sign in at /executive/login with their email and password.
        </p>
      )}

      <div className="cols">
        <div className="side">
          <section className="panel">
            <h2>Profile</h2>
            <EditExecutiveForm action={updateExecutiveAction.bind(null, executive.id)} executive={executive} />
          </section>

          <section className="panel">
            <h2>Reset password</h2>
            <p className="muted">This signs the executive out of all existing sessions.</p>
            <ResetPasswordForm action={resetPasswordAction.bind(null, executive.id)} />
          </section>
        </div>

        <div className="side">
          <section className="panel">
            <h2>Details</h2>
            <dl className="meta">
              <dt>Email</dt>
              <dd>{executive.email}</dd>
              <dt>Phone</dt>
              <dd>{executive.phone ?? "—"}</dd>
              <dt>Team</dt>
              <dd>
                {executive.team ? (
                  <Link href={`/admin/teams/${executive.team.id}`}>{executive.team.name}</Link>
                ) : (
                  "No team"
                )}
              </dd>
              <dt>Created</dt>
              <dd>{formatDate(executive.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(executive.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Team</h2>
            {executive.team && !executive.team.isActive && (
              <p className="notice notice-error">The current team is inactive.</p>
            )}
            {otherTeams.length > 0 ? (
              <AssignTeamForm
                action={assignTeamAction.bind(null, executive.id)}
                teams={otherTeams}
                label={executive.team ? "Move to team" : "Assign team"}
              />
            ) : (
              <p className="muted">
                No other active teams. <Link href="/admin/teams#new">Create a team</Link>.
              </p>
            )}
            {executive.team && (
              <>
                <p className="field-hint">
                  Executives who are the primary executive on a property can&apos;t leave that team.
                </p>
                <ActionForm
                  action={removeTeamAction.bind(null, executive.id)}
                  label="Remove from team"
                  pendingLabel="Removing…"
                  confirm={`Remove ${executive.name} from ${executive.team.name}?`}
                />
              </>
            )}
          </section>

          <section className="panel">
            <h2>Access</h2>
            <p className="muted">
              {executive.isActive
                ? "Deactivating blocks sign-in and ends their current session on the next request."
                : "This executive can't sign in until activated."}
            </p>
            <ActionForm
              action={setExecutiveStatusAction.bind(null, executive.id, !executive.isActive)}
              label={executive.isActive ? "Deactivate" : "Activate"}
              pendingLabel="Updating…"
              variant={executive.isActive ? "line" : "solid"}
              confirm={executive.isActive ? `Deactivate ${executive.name}?` : undefined}
            />
            <ActionForm
              action={deleteExecutiveAction.bind(null, executive.id)}
              label="Delete executive"
              pendingLabel="Deleting…"
              variant="danger"
              confirm={`Delete ${executive.name}? They will be deactivated and hidden from lists.`}
            />
          </section>
        </div>
      </div>
    </>
  );
}
