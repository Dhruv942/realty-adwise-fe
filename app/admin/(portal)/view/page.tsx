import type { Metadata } from "next";
import Link from "next/link";
import { PersonList } from "@/components/view/PersonList";
import { listViewableExecutives, listViewableManagers } from "@/lib/view";

export const metadata: Metadata = { title: "Switch dashboard" };

export default async function SwitchDashboardPage() {
  const [managers, executives] = await Promise.all([listViewableManagers(), listViewableExecutives("ADMIN")]);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Switch dashboard</h1>
          <p className="muted">Look at a manager&apos;s or an executive&apos;s dashboard. It is read-only and you stay signed in as admin.</p>
        </div>
        <Link className="btn btn-line" href="/admin">Admin dashboard</Link>
      </div>

      <section aria-labelledby="sw-managers" className="grid gap-3">
        <h2 id="sw-managers">Manager dashboards</h2>
        <PersonList
          people={managers.map((m) => ({ id: m.id, name: m.name, username: m.username, isActive: m.isActive }))}
          href={(id) => `/admin/view/manager/${id}`}
          empty={<><strong>No managers yet</strong><Link href="/admin/managers/new">Create the first manager</Link>.</>}
        />
      </section>

      <section aria-labelledby="sw-execs" className="grid gap-3">
        <h2 id="sw-execs">Executive dashboards</h2>
        <PersonList
          people={executives.map((e) => ({ id: e.id, name: e.name, username: e.username, isActive: e.isActive, sub: e.manager ? `reports to ${e.manager.name}` : "no manager" }))}
          href={(id) => `/admin/view/executive/${id}`}
          empty={<><strong>No executives yet</strong><Link href="/admin/executives/new">Add the first executive</Link>.</>}
        />
      </section>
    </>
  );
}
