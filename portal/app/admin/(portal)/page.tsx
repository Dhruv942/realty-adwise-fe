import type { Metadata } from "next";
import Link from "next/link";
import { listExecutives, listTeams } from "@/lib/admin";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverview() {
  const [{ user }, teams, executives] = await Promise.all([requireSession("ADMIN"), listTeams(), listExecutives()]);
  const activeTeams = teams.filter((t) => t.isActive).length;
  const activeExecutives = executives.filter((e) => e.isActive).length;
  const unassigned = executives.filter((e) => e.isActive && !e.team).length;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Hello, {user.name}</h1>
        </div>
        <div className="row">
          <Link className="btn btn-line" href="/admin/teams#new">
            New team
          </Link>
          <Link className="btn btn-solid" href="/admin/executives/new">
            New executive
          </Link>
        </div>
      </div>

      <section className="stats" aria-label="Summary">
        <Link className="stat" href="/admin/teams?isActive=true">
          <span className="label">Active teams</span>
          <strong>{activeTeams}</strong>
          <span className="muted">{teams.length} in total</span>
        </Link>
        <Link className="stat" href="/admin/executives?isActive=true">
          <span className="label">Active executives</span>
          <strong>{activeExecutives}</strong>
          <span className="muted">{executives.length} in total</span>
        </Link>
        <Link className="stat" href="/admin/executives?isActive=true">
          <span className="label">Without a team</span>
          <strong>{unassigned}</strong>
          <span className="muted">active executives</span>
        </Link>
      </section>

      {teams.length === 0 && (
        <section className="panel">
          <h2>Start by creating a team</h2>
          <p className="muted">
            Executives can only join an active team, so create your teams first. You can also create executives now and
            assign them later.
          </p>
          <div>
            <Link className="btn btn-solid" href="/admin/teams#new">
              Create a team
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
