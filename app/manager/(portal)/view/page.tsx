import type { Metadata } from "next";
import Link from "next/link";
import { PersonList } from "@/components/view/PersonList";
import { listViewableExecutives } from "@/lib/view";

export const metadata: Metadata = { title: "Switch to Executive" };

export default async function SwitchToExecutivePage() {
  const executives = await listViewableExecutives("MANAGER");
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Switch to Executive</h1>
          <p className="muted">Look at the dashboard of one of your executives. It is read-only and you stay signed in as a manager.</p>
        </div>
        <Link className="btn btn-line" href="/manager">Manager dashboard</Link>
      </div>
      <PersonList
        people={executives.map((e) => ({ id: e.id, name: e.name, username: e.username, isActive: e.isActive }))}
        href={(id) => `/manager/view/executive/${id}`}
        empty={<><strong>No executives report to you yet</strong>Ask an admin to assign executives to you.</>}
      />
    </>
  );
}
