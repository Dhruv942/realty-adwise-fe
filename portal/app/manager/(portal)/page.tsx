import { ArrowRight, Bookmark, Clock, UserRound, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { Card } from "@/components/ui/card";
import { formatBudget } from "@/lib/format";
import { listManagerExecutives, listManagerLeads, listManagerTeams } from "@/lib/manager";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const time = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Kolkata" });

function Stat({ href, label, value, note, icon: Icon, alert }: { href: string; label: string; value: number; note: string; icon: typeof Clock; alert?: boolean }) {
  return (
    <Link href={href} className="block rounded-2xl">
      <Card className={cn("h-full p-4 transition-colors hover:border-border-strong sm:p-5", alert && "border-danger/30 bg-danger-soft/50")}>
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-[11px] uppercase tracking-[.16em] text-muted-foreground">{label}</p>
          <Icon className={cn("size-4 shrink-0 text-muted-foreground", alert && "text-danger")} />
        </div>
        <p className={cn("mt-3 font-display text-4xl font-extralight leading-none", alert && "text-danger")}>{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      </Card>
    </Link>
  );
}

export default async function ManagerOverview() {
  const [{ user }, teams, executives, pending, important, recent] = await Promise.all([
    requireSession("MANAGER"),
    listManagerTeams(),
    listManagerExecutives(),
    listManagerLeads({ status: "PENDING_ASSIGNMENT", limit: "200" }),
    listManagerLeads({ important: "true", limit: "200" }),
    listManagerLeads({ limit: "6" }),
  ]);
  const activeExecutives = executives.filter((e) => e.isActive).length;

  return (
    <>
      <div>
        <p className="eyebrow">Overview</p>
        <h1>Hello, {user.name.split(" ")[0]}</h1>
      </div>

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat href="/manager/leads?status=PENDING_ASSIGNMENT" label="Need assigning" value={pending.length} note={pending.length ? "Waiting for an executive" : "Nothing waiting"} icon={Clock} alert={pending.length > 0} />
        <Stat href="/manager/leads?important=true" label="Important" value={important.length} note="Marked by you" icon={Bookmark} />
        <Stat href="/manager/team" label="Executives" value={activeExecutives} note="Active in your teams" icon={UserRound} />
        <Stat href="/manager/team" label="Teams" value={teams.length} note={teams.length === 1 ? "Team you lead" : "Teams you lead"} icon={UsersRound} />
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <h2 className="!text-lg">Latest leads</h2>
          <Link href="/manager/leads" className="inline-flex min-h-9 items-center gap-1 font-display text-[11px] uppercase tracking-[.16em] text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-4 py-10 text-center text-muted-foreground">No leads yet.</p>
        ) : (
          <ul>
            {recent.map((l) => (
              <li key={l.id} className="border-b border-border last:border-0">
                <Link href={`/manager/leads/${l.id}`} className="grid gap-1.5 px-4 py-3.5 hover:bg-muted/60 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate">
                      {l.customer.name}
                      {l.isImportant && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-display text-[10px] uppercase tracking-[.14em] text-amber-800">Important</span>}
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
                    {time.format(new Date(l.createdAt))} · {l.assignedExecutive ? l.assignedExecutive.name : "Unassigned"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
