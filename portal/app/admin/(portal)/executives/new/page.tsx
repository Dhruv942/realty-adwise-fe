import type { Metadata } from "next";
import Link from "next/link";
import { CreateExecutiveForm } from "@/components/ExecutiveForms";
import { createExecutiveAction } from "@/lib/actions/executives";
import { listTeams } from "@/lib/admin";

export const metadata: Metadata = { title: "New executive" };

export default async function NewExecutivePage({ searchParams }: { searchParams: Promise<{ teamId?: string }> }) {
  const { teamId } = await searchParams;
  // Executives can only join active teams.
  const teams = await listTeams({ isActive: "true" });
  const defaultTeamId = teams.some((t) => t.id === teamId) ? teamId : undefined;

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
        <CreateExecutiveForm action={createExecutiveAction} teams={teams} defaultTeamId={defaultTeamId} />
      </section>
    </>
  );
}
