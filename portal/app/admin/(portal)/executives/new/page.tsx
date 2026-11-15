import type { Metadata } from "next";
import Link from "next/link";
import { CreateExecutiveForm } from "@/components/ExecutiveForms";
import { createExecutiveAction } from "@/lib/actions/executives";
import { listManagers } from "@/lib/admin";

export const metadata: Metadata = { title: "New executive" };

export default async function NewExecutivePage({ searchParams }: { searchParams: Promise<{ managerId?: string }> }) {
  const { managerId } = await searchParams;
  // Executives can only report to active managers.
  const managers = await listManagers({ isActive: "true" });
  const defaultManagerId = managers.some((m) => m.id === managerId) ? managerId : undefined;

  return (
    <>
      <div className="page-head">
        <div>
          <Link className="back" href="/admin/executives">
            <span aria-hidden="true">←</span> Executives
          </Link>
          <h1>New executive</h1>
        </div>
      </div>
      <section className="panel">
        <CreateExecutiveForm action={createExecutiveAction} managers={managers} defaultManagerId={defaultManagerId} />
      </section>
    </>
  );
}
