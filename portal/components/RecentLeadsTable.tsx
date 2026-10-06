import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { formatBudget } from "@/lib/format";
import type { Lead } from "@/lib/types";

const time = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Kolkata" });

/** Compact lead table for dashboards. Less important columns drop away on small screens. */
export function RecentLeadsTable({ title, leads, detailBase, allHref, empty }: { title: string; leads: Lead[]; detailBase: string; allHref: string; empty: React.ReactNode }) {
  return (
    <section aria-labelledby="recent-leads" className="grid min-w-0 content-start gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-leads">{title}</h2>
        <Link href={allHref} className="inline-flex min-h-8 items-center gap-1 rounded-md text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
          View all <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      {leads.length === 0 ? (
        <div className="empty rounded-xl border border-dashed border-border-strong">{empty}</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col" className="w-[38%]">Client</th>
                <th scope="col" className="hidden md:table-cell">Property</th>
                <th scope="col" className="hidden xl:table-cell">Executive</th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden sm:table-cell">Received</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const sub = [l.requirement, l.budget != null ? formatBudget(l.budget) : null].filter(Boolean).join(" · ");
                return (
                <tr key={l.id}>
                  <td className="max-w-0">
                    <div className="flex items-baseline gap-2">
                      <Link className="person-name truncate" href={`${detailBase}/${l.id}`}>
                        {l.customer.name}
                      </Link>
                      <span className="num shrink-0 text-xs text-muted-foreground">#{l.leadNo}</span>
                      {l.isImportant && <span className="shrink-0 text-xs font-medium text-warning">Important</span>}
                    </div>
                    <div className="muted person-sub truncate">
                      <span className="md:hidden">
                        {l.property.name}
                        {sub ? " · " : ""}
                      </span>
                      {sub}
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className="block max-w-[14rem] truncate">{l.property.name}</span>
                  </td>
                  <td className="hidden xl:table-cell">{l.assignedExecutive ? l.assignedExecutive.name : <span className="muted">Unassigned</span>}</td>
                  <td>
                    <LeadStatusBadge status={l.status} />
                  </td>
                  <td className="muted hidden whitespace-nowrap text-[13px] sm:table-cell">{time.format(new Date(l.createdAt))}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
