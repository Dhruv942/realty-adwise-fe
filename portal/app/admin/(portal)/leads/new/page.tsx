import type { Metadata } from "next";
import Link from "next/link";
import { CreateLeadForm } from "@/components/LeadForms";
import { createLeadAction } from "@/lib/actions/leads";

export const metadata: Metadata = { title: "Add lead" };

export default function NewLeadPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/leads">
            <span aria-hidden="true">←</span> Leads
          </Link>
          <h1>Add lead</h1>
        </div>
      </div>
      <section className="panel">
        <CreateLeadForm action={createLeadAction} />
      </section>
    </>
  );
}
