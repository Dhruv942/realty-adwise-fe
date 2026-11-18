import type { Metadata } from "next";
import Link from "next/link";
import { listCustomers } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Clients" };

const PAGE = 50;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const rows = await listCustomers({ search: search.trim() || undefined, limit: String(PAGE + 1), offset: String((page - 1) * PAGE) });
  const customers = rows.slice(0, PAGE);
  const hasNext = rows.length > PAGE;
  const href = (n: number) => `/admin/customers?${new URLSearchParams({ ...(search ? { search } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Clients</h1>
        </div>
      </div>
      <p className="muted">Clients are created automatically from the first lead with a new mobile number.</p>

      <form className="filters" method="get" role="search">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" name="search" type="search" defaultValue={search} placeholder="Name, mobile or email" />
        </div>
        <button className="btn btn-line" type="submit">
          Search
        </button>
        {search && (
          <Link className="btn btn-line" href="/admin/customers">
            Clear
          </Link>
        )}
      </form>

      <div className="table-wrap table-exec">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th className="hidden md:table-cell">Email</th>
              <th className="hidden sm:table-cell">Added</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link className="person-name" href={`/admin/customers/${c.id}`}>
                    {c.name}
                  </Link>
                </td>
                <td className="num whitespace-nowrap">{c.mobile}</td>
                <td className="hidden md:table-cell">{c.email ?? <span className="muted">—</span>}</td>
                <td className="muted hidden whitespace-nowrap sm:table-cell">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  {search ? (
                    <>
                      <strong>No clients match “{search}”</strong>
                      Check the spelling, or search by mobile number instead.
                    </>
                  ) : (
                    <>
                      <strong>No clients yet</strong>
                      A client is created automatically from the first lead with a new mobile number.
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(page > 1 || hasNext) && (
        <nav className="pager" aria-label="Pagination">
          {page > 1 ? <Link className="btn btn-line btn-sm" href={href(page - 1)}>← Newer</Link> : <span />}
          <span className="muted">Page {page}</span>
          {hasNext ? <Link className="btn btn-line btn-sm" href={href(page + 1)}>Older →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
