import type { Metadata } from "next";
import Link from "next/link";
import { CreateLeadForm } from "@/components/LeadForms";
import { createManagerLeadAction } from "@/lib/actions/leads";
import { listManagerExecutives } from "@/lib/manager";

export const metadata: Metadata = { title: "Add lead" };

export default async function ManagerNewLeadPage() {
  const executives = (await listManagerExecutives()).filter((e) => e.isActive);
  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/manager/leads">
            <span aria-hidden="true">←</span> Leads
          </Link>
          <h1>Add lead</h1>
        </div>
      </div>
      <section className="panel">
        <CreateLeadForm action={createManagerLeadAction} executives={executives.map((e) => ({ id: e.id, name: e.name }))} />
      </section>
    </>
  );
}
