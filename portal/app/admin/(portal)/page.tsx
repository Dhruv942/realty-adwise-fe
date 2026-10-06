import { ArrowRight, Plus, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MetricStrip } from "@/components/MetricStrip";
import { RecentLeadsTable } from "@/components/RecentLeadsTable";
import { Button } from "@/components/ui/button";
import { listExecutives, listLeads, listProperties, listTeams } from "@/lib/admin";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Overview" };

const RECENT = 8;
const FETCH = 200;
const ATTENTION = 6;
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export default async function AdminOverview() {
  const [{ user }, teams, executives, properties, leads] = await Promise.all([
    requireSession("ADMIN"),
    listTeams(),
    listExecutives(),
    listProperties(),
    listLeads({ limit: String(FETCH) }),
  ]);

  const activeExecutives = executives.filter((e) => e.isActive);
  const withoutTeam = activeExecutives.filter((e) => !e.team).length;
  const activeTeams = teams.filter((t) => t.isActive).length;
  const needing = properties.filter((p) => p.needsAssignment && p.isActive);
  const pendingLeads = properties.reduce((sum, p) => sum + p.pendingLeadCount, 0);
  const today = day.format(new Date());
  const todayCount = leads.filter((l) => day.format(new Date(l.createdAt)) === today).length;
  const recent = leads.slice(0, RECENT);
  const allClear = needing.length === 0 && withoutTeam === 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="muted">{allClear ? "Everything is assigned. New leads will route automatically." : "A few things need your attention."}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button asChild variant="outline">
            <Link href="/admin/executives/new">
              <UserPlus aria-hidden="true" /> New executive
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/leads/new">
              <Plus aria-hidden="true" /> Add lead
            </Link>
          </Button>
        </div>
      </div>

      <MetricStrip
        items={[
          { href: "/admin/leads", label: "Leads today", value: leads.length >= FETCH && todayCount >= FETCH ? `${FETCH}+` : todayCount, note: "Received since midnight" },
          { href: "/admin/leads?status=PENDING_ASSIGNMENT", label: "Pending", value: pendingLeads, note: pendingLeads ? "Waiting for an executive" : "Nothing waiting", alert: pendingLeads > 0 },
          { href: "/admin/properties?assigned=false", label: "Need executives", value: needing.length, note: needing.length === 1 ? "Property without executives" : "Properties without executives", alert: needing.length > 0 },
          { href: "/admin/executives?isActive=true", label: "Active executives", value: activeExecutives.length, note: withoutTeam ? `${withoutTeam} without a team` : `Across ${activeTeams} active ${activeTeams === 1 ? "team" : "teams"}` },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <RecentLeadsTable
          title="Recent leads"
          leads={recent}
          detailBase="/admin/leads"
          allHref="/admin/leads"
          empty={
            <>
              <strong>No leads yet</strong>
              Leads appear here as they arrive. You can also <Link href="/admin/leads/new">add one by hand</Link>.
            </>
          }
        />

        <section aria-labelledby="attention" className="grid min-w-0 content-start gap-3">
          <h2 id="attention">Needs attention</h2>
          {allClear ? (
            <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted-foreground">
              All caught up. Every active property has executives, and every executive is in a team.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {needing.slice(0, ATTENTION).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/properties/${p.id}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block text-[13px] text-muted-foreground">
                        No executives · {p.pendingLeadCount} pending {p.pendingLeadCount === 1 ? "lead" : "leads"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium">
                      Assign <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
              {needing.length > ATTENTION && (
                <li>
                  <Link href="/admin/properties?assigned=false" className="flex min-h-11 items-center px-4 text-[13px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
                    {needing.length - ATTENTION} more {needing.length - ATTENTION === 1 ? "property" : "properties"}
                  </Link>
                </li>
              )}
              {withoutTeam > 0 && (
                <li>
                  <Link href="/admin/executives?isActive=true" className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {withoutTeam} {withoutTeam === 1 ? "executive has" : "executives have"} no team
                      </span>
                      <span className="block text-[13px] text-muted-foreground">Open Executives to add them to a team</span>
                    </span>
                    <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              )}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
