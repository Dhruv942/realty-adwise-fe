import { ArrowRight, Building2, CalendarDays, Clock, Plus, UserPlus, UserRound, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listExecutives, listLeads, listProperties, listTeams } from "@/lib/admin";
import { formatBudget } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const RECENT = 6;
const FETCH = 200;
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
const time = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Kolkata" });

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function Stat({
  href,
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
}: {
  href: string;
  label: string;
  value: string | number;
  note: string;
  icon: typeof Clock;
  tone?: "default" | "alert";
}) {
  return (
    <Link href={href} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2">
      <Card className={cn("h-full p-4 transition-colors group-hover:border-border-strong sm:p-5", tone === "alert" && "border-danger/30 bg-danger-soft/50")}>
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-[11px] uppercase tracking-[.16em] text-muted-foreground">{label}</p>
          <Icon className={cn("size-4 shrink-0 text-muted-foreground", tone === "alert" && "text-danger")} />
        </div>
        <p className={cn("mt-3 font-display text-4xl font-extralight leading-none sm:text-[40px]", tone === "alert" && "text-danger")}>{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      </Card>
    </Link>
  );
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

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button asChild variant="outline">
            <Link href="/admin/executives/new">
              <UserPlus /> New executive
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/leads/new">
              <Plus /> Add lead
            </Link>
          </Button>
        </div>
      </div>

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat href="/admin/leads" label="Leads today" value={leads.length >= FETCH && todayCount >= FETCH ? `${FETCH}+` : todayCount} note="Received since midnight" icon={CalendarDays} />
        <Stat
          href="/admin/leads?status=PENDING_ASSIGNMENT"
          label="Pending"
          value={pendingLeads}
          note={pendingLeads ? "Waiting for an executive" : "Nothing waiting"}
          icon={Clock}
          tone={pendingLeads ? "alert" : "default"}
        />
        <Stat href="/admin/properties?assigned=false" label="Need executives" value={needing.length} note={needing.length === 1 ? "Property" : "Properties"} icon={Building2} tone={needing.length ? "alert" : "default"} />
        <Stat href="/admin/executives?isActive=true" label="Executives" value={activeExecutives.length} note={withoutTeam ? `${withoutTeam} without a team` : `${activeTeams} active ${activeTeams === 1 ? "team" : "teams"}`} icon={UserRound} />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-6">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
            <h2 className="!text-lg">Recent leads</h2>
            <Link href="/admin/leads" className="inline-flex min-h-9 items-center gap-1 font-display text-[11px] uppercase tracking-[.16em] text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="grid justify-items-center gap-3 px-4 py-10 text-center">
              <p className="text-muted-foreground">No leads yet.</p>
              <Button asChild size="sm">
                <Link href="/admin/leads/new">Add the first lead</Link>
              </Button>
            </div>
          ) : (
            <ul>
              {recent.map((l) => (
                <li key={l.id} className="border-b border-border last:border-0">
                  <Link href={`/admin/leads/${l.id}`} className="grid gap-1.5 px-4 py-3.5 hover:bg-muted/60 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate">
                        <span className="text-foreground">{l.customer.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">#{l.leadNo}</span>
                      </p>
                      <LeadStatusBadge status={l.status} />
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {l.property.name}
                      {l.requirement ? ` · ${l.requirement}` : ""}
                      {l.budget != null ? ` · ${formatBudget(l.budget)}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {time.format(new Date(l.createdAt))} · {l.assignedExecutive ? `Assigned to ${l.assignedExecutive.name}` : "Unassigned"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid gap-5 lg:gap-6">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-3 sm:px-5">
              <h2 className="!text-lg">Needs attention</h2>
            </div>
            {needing.length === 0 && withoutTeam === 0 ? (
              <p className="px-4 py-8 text-center text-muted-foreground sm:px-5">All caught up. Every property has executives.</p>
            ) : (
              <ul>
                {needing.slice(0, 5).map((p) => (
                  <li key={p.id} className="border-b border-border last:border-0">
                    <Link href={`/admin/properties/${p.id}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60 sm:px-5">
                      <span className="min-w-0">
                        <span className="block truncate">{p.name}</span>
                        <span className="block text-sm text-muted-foreground">{p.pendingLeadCount} pending {p.pendingLeadCount === 1 ? "lead" : "leads"}</span>
                      </span>
                      <span className="shrink-0 font-display text-[11px] uppercase tracking-[.14em] text-danger">Assign</span>
                    </Link>
                  </li>
                ))}
                {needing.length > 5 && (
                  <li className="border-b border-border">
                    <Link href="/admin/properties?assigned=false" className="flex min-h-12 items-center px-4 text-sm text-muted-foreground hover:text-foreground sm:px-5">
                      +{needing.length - 5} more properties
                    </Link>
                  </li>
                )}
                {withoutTeam > 0 && (
                  <li>
                    <Link href="/admin/executives?isActive=true" className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60 sm:px-5">
                      <span>
                        <span className="block">{withoutTeam} {withoutTeam === 1 ? "executive has" : "executives have"} no team</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </Card>

          <Card className="grid gap-1 p-2">
            {[
              { href: "/admin/properties", label: "Properties", note: `${properties.length} total`, icon: Building2 },
              { href: "/admin/teams", label: "Teams", note: `${activeTeams} active`, icon: UsersRound },
              { href: "/admin/executives", label: "Executives", note: `${executives.length} total`, icon: UserRound },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-muted">
                <q.icon className="size-5 text-muted-foreground" />
                <span className="flex-1">{q.label}</span>
                <span className="text-sm text-muted-foreground">{q.note}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
