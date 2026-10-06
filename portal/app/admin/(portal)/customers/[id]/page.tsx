import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditCustomerForm } from "@/components/LeadForms";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { updateCustomerAction } from "@/lib/actions/customers";
import { getCustomer } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { formatBudget, formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  try {
    return await getCustomer(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await load(id)).name };
}

export default async function CustomerPage({ params }: Props) {
  const { id } = await params;
  const c = await load(id);

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/customers">
            <span aria-hidden="true">←</span> Clients
          </Link>
          <h1>{c.name}</h1>
          <p className="muted">
            {c.mobile} · {c.type === "COMPANY" ? "Company" : "Individual"}
          </p>
        </div>
      </div>

      <div className="cols">
        <section className="panel">
          <h2>Enquiries ({c.leads.length})</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Property</th>
                  <th>Requirement</th>
                  <th>Budget</th>
                  <th>Executive</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {c.leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link href={`/admin/leads/${l.id}`}>#{l.leadNo}</Link>
                      <div className="muted person-sub">{formatDate(l.createdAt)}</div>
                    </td>
                    <td>{l.property.name}</td>
                    <td>{l.requirement ?? <span className="muted">—</span>}</td>
                    <td>{formatBudget(l.budget)}</td>
                    <td>{l.assignedExecutive?.name ?? <span className="muted">Unassigned</span>}</td>
                    <td>
                      <LeadStatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
                {c.leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">
                      No enquiries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Details</h2>
          <EditCustomerForm action={updateCustomerAction.bind(null, c.id)} customer={c} />
        </section>
      </div>
    </>
  );
}
