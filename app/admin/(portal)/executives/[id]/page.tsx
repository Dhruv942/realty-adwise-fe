import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { AssignManagerForm, EditExecutiveForm, ResetPasswordForm } from "@/components/ExecutiveForms";
import { StatusBadge } from "@/components/StatusBadge";
import {
  assignManagerAction,
  deleteExecutiveAction,
  removeManagerAction,
  resetPasswordAction,
  setExecutiveStatusAction,
  updateExecutiveAction,
} from "@/lib/actions/executives";
import { getExecutive, listManagers } from "@/lib/admin";
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
  const [executive, activeManagers] = await Promise.all([loadExecutive(id), listManagers({ isActive: "true" })]);
  const otherManagers = activeManagers.filter((m) => m.id !== executive.manager?.id);

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/executives">
            <span aria-hidden="true">←</span> Executives
          </Link>
          <h1>{executive.name}</h1>
          <p className="muted">@{executive.username}</p>
        </div>
        <StatusBadge active={executive.isActive} />
      </div>

      {created && (
        <p className="notice notice-success" role="status">
          Executive created. They can now sign in with their email and password.
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
              <dt>Manager</dt>
              <dd>
                {executive.manager ? (
                  <Link href={`/admin/managers/${executive.manager.id}`}>{executive.manager.name}</Link>
                ) : (
                  "No manager"
                )}
              </dd>
              <dt>Created</dt>
              <dd>{formatDate(executive.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(executive.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Manager</h2>
            {executive.manager && !executive.manager.isActive && (
              <p className="notice notice-warn">The current manager is inactive.</p>
            )}
            <p className="field-hint">The manager sees this executive&apos;s leads and can assign leads and properties to them.</p>
            {otherManagers.length > 0 ? (
              <AssignManagerForm
                action={assignManagerAction.bind(null, executive.id)}
                managers={otherManagers}
                label={executive.manager ? "Change manager" : "Assign manager"}
              />
            ) : (
              <p className="muted">
                No other active managers. <Link href="/admin/managers/new">Create a manager</Link>.
              </p>
            )}
            {executive.manager && (
              <ActionForm
                action={removeManagerAction.bind(null, executive.id)}
                label="Remove manager"
                pendingLabel="Removing…"
                confirm={`Remove ${executive.manager.name} as ${executive.name}'s manager?`}
              />
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
