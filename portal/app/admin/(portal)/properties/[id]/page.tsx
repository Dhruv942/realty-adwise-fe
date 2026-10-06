import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { AssignExecutivesForm, EditPropertyForm } from "@/components/PropertyForms";
import { StatusBadge } from "@/components/StatusBadge";
import { setExecutivesAction, setPropertyStatusAction, updatePropertyAction } from "@/lib/actions/properties";
import { getProperty, listExecutives } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function loadProperty(id: string) {
  try {
    return await getProperty(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await loadProperty(id)).name };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const [property, executives] = await Promise.all([loadProperty(id), listExecutives({ isActive: "true" })]);
  const choices = executives.map((e) => ({ id: e.id, name: e.name, username: e.username, teamName: e.team?.name ?? null }));

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/properties">
            ← Properties
          </Link>
          <h1>{property.name}</h1>
          <p className="muted">{property.location ?? "No location"}</p>
        </div>
        <StatusBadge active={property.isActive} />
      </div>

      {property.needsAssignment && (
        <p className="notice notice-error" role="status">
          No executives are picked for this property.
          {property.pendingLeadCount > 0 && (
            <>
              {" "}
              <Link href={`/admin/leads?status=PENDING_ASSIGNMENT&propertyId=${property.id}`}>
                {property.pendingLeadCount} pending lead{property.pendingLeadCount === 1 ? "" : "s"}
              </Link>{" "}
              will be assigned as soon as you save.
            </>
          )}
        </p>
      )}

      <div className="cols">
        <div className="side">
          <section className="panel">
            <h2>Executives</h2>
            <AssignExecutivesForm
              action={setExecutivesAction.bind(null, property.id)}
              choices={choices}
              selected={property.executives.filter((e) => e.isActive).map((e) => e.id)}
              inactiveSelected={property.executives.filter((e) => !e.isActive)}
            />
          </section>

          <section className="panel">
            <h2>Details</h2>
            <EditPropertyForm action={updatePropertyAction.bind(null, property.id)} property={property} />
          </section>
        </div>

        <div className="side">
          <section className="panel">
            <h2>Summary</h2>
            <dl className="meta">
              <dt>Executives</dt>
              <dd>{property.assignedExecutiveCount}</dd>
              <dt>Pending leads</dt>
              <dd>{property.pendingLeadCount}</dd>
              <dt>Leads</dt>
              <dd>
                <Link href={`/admin/leads?propertyId=${property.id}`}>View all</Link>
              </dd>
              <dt>Created</dt>
              <dd>{formatDate(property.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(property.updatedAt)}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Access</h2>
            <p className="muted">
              {property.isActive ? "Inactive properties reject new leads." : "New leads for this property are rejected until it is activated."}
            </p>
            <ActionForm
              action={setPropertyStatusAction.bind(null, property.id, !property.isActive)}
              label={property.isActive ? "Deactivate" : "Activate"}
              pendingLabel="Updating…"
              variant={property.isActive ? "danger" : "solid"}
              confirm={property.isActive ? `Deactivate ${property.name}?` : undefined}
            />
          </section>
        </div>
      </div>
    </>
  );
}
