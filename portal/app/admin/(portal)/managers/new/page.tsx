import type { Metadata } from "next";
import Link from "next/link";
import { CreateManagerForm } from "@/components/ManagerForms";
import { createManagerAction } from "@/lib/actions/managers";

export const metadata: Metadata = { title: "New manager" };

export default function NewManagerPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/managers">
            <span aria-hidden="true">←</span> Managers
          </Link>
          <h1>New manager</h1>
        </div>
      </div>
      <section className="panel">
        <CreateManagerForm action={createManagerAction} />
      </section>
    </>
  );
}
