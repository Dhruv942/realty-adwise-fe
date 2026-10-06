import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { ResetPasswordForm } from "@/components/ExecutiveForms";
import { EditManagerForm } from "@/components/ManagerForms";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteManagerAction, resetManagerPasswordAction, setManagerStatusAction, updateManagerAction } from "@/lib/actions/managers";
import { getManager } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

async function load(id: string) {
  try {
    return await getManager(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await load(id)).name };
}

export default async function ManagerPage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const manager = await load(id);

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/managers">
            <span aria-hidden="true">←</span> Managers
          </Link>
          <h1>{manager.name}</h1>
          <p className="muted">@{manager.username}</p>
        </div>
        <StatusBadge active={manager.isActive} />
      </div>

      {created && (
        <p className="notice notice-success" role="status">
          Manager created. They can sign in at /manager/login. Next, make them the manager of a team.
        </p>
      )}

      <div className="cols">
        <div className="side">
          <section className="panel">
            <h2>Profile</h2>
            <EditManagerForm action={updateManagerAction.bind(null, manager.id)} manager={manager} />
          </section>
          <section className="panel">
            <h2>Reset password</h2>
            <p className="muted">This signs the manager out of all existing sessions.</p>
            <ResetPasswordForm action={resetManagerPasswordAction.bind(null, manager.id)} />
          </section>
        </div>

        <div className="side">
          <section className="panel">
            <h2>Teams they lead</h2>
            {manager.managedTeams?.length ? (
              <ul className="grid gap-2">
                {manager.managedTeams.map((t) => (
                  <li key={t.id}>
                    <Link href={`/admin/teams/${t.id}`}>{t.name}</Link>
                    <span className="muted"> · {t.executiveCount} executives</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                No teams yet. Pick this manager when you <Link href="/admin/teams#new">create</Link> or edit a team.
              </p>
            )}
          </section>

          <section className="panel">
            <h2>Details</h2>
            <dl className="meta">
              <dt>Email</dt>
              <dd>{manager.email}</dd>
              <dt>Phone</dt>
              <dd>{manager.phone ?? "—"}</dd>
              <dt>Created</dt>
              <dd>{formatDate(manager.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(manager.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Access</h2>
            <p className="muted">{manager.isActive ? "Deactivating stops them signing in." : "This manager can't sign in until activated."}</p>
            <ActionForm
              action={setManagerStatusAction.bind(null, manager.id, !manager.isActive)}
              label={manager.isActive ? "Deactivate" : "Activate"}
              pendingLabel="Updating…"
              variant={manager.isActive ? "line" : "solid"}
              confirm={manager.isActive ? `Deactivate ${manager.name}?` : undefined}
            />
            <ActionForm
              action={deleteManagerAction.bind(null, manager.id)}
              label="Delete manager"
              pendingLabel="Deleting…"
              variant="danger"
              confirm={`Delete ${manager.name}? Their teams stay but will have no manager.`}
            />
          </section>
        </div>
      </div>
    </>
  );
}
