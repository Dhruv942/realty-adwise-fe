import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listManagers } from "@/lib/admin";

export const metadata: Metadata = { title: "Managers" };

type SearchParams = Promise<{ search?: string; isActive?: string; deleted?: string }>;

export default async function ManagersPage({ searchParams }: { searchParams: SearchParams }) {
  const { search = "", isActive = "", deleted } = await searchParams;
  const status = isActive === "true" || isActive === "false" ? isActive : "";
  const managers = await listManagers({ search: search.trim() || undefined, isActive: status || undefined });
  const filtered = Boolean(search || status);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Managers</h1>
        </div>
        <Link className="btn btn-solid" href="/admin/managers/new">
          + New manager
        </Link>
      </div>

      {deleted && (
        <p className="notice notice-success" role="status">
          Manager deleted.
        </p>
      )}

      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={search} placeholder="Name, email or username" />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="isActive" defaultValue={status}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <button className="btn btn-line" type="submit">
          Filter
        </button>
        {filtered && (
          <Link className="btn btn-line" href="/admin/managers">
            Clear
          </Link>
        )}
      </form>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {managers.map((m) => (
          <li key={m.id}>
            <Link href={`/admin/managers/${m.id}`} className="grid gap-3 rounded-2xl border border-border bg-card p-4 no-underline transition-colors hover:border-border-strong">
              <div className="flex items-center justify-between gap-3">
                <div className="person">
                  <span className="avatar" aria-hidden="true">
                    {m.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate">{m.name}</p>
                    <p className="muted person-sub">@{m.username}</p>
                  </div>
                </div>
                <StatusBadge active={m.isActive} />
              </div>
              <p className="truncate text-sm text-muted-foreground">{m.email}</p>
            </Link>
          </li>
        ))}
      </ul>
      {managers.length === 0 && <p className="empty panel">{filtered ? "No managers match these filters." : "No managers yet. Create the first one."}</p>}
    </>
  );
}
