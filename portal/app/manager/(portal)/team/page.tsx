import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { listManagerExecutives, listManagerTeams } from "@/lib/manager";
import { DESIGNATION_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

export default async function ManagerTeamPage() {
  const [teams, executives] = await Promise.all([listManagerTeams(), listManagerExecutives()]);
  const noTeam = executives.filter((e) => !e.team || !teams.some((t) => t.id === e.team!.id));

  const Row = ({ e }: { e: (typeof executives)[number] }) => (
    <li>
      <Link href={`/manager/leads?executiveId=${e.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
        <span className="avatar" aria-hidden="true">
          {e.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{e.name}</span>
          <span className="block truncate text-[13px] text-muted-foreground">
            {e.designation ? DESIGNATION_LABEL[e.designation] : "Sales Executive"} · {e.email}
          </span>
        </span>
        <StatusBadge active={e.isActive} />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Team</h1>
          <p className="muted">Select an executive to see their leads.</p>
        </div>
      </div>

      {teams.length === 0 && (
        <div className="empty rounded-xl border border-dashed border-border-strong">
          <strong>You don&apos;t lead any teams yet</strong>
          Ask an admin to make you a team&apos;s manager.
        </div>
      )}

      {teams.map((t) => {
        const members = executives.filter((e) => e.team?.id === t.id);
        return (
          <section key={t.id} aria-labelledby={`team-${t.id}`} className="grid gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <div className="min-w-0">
                <h2 id={`team-${t.id}`}>{t.name}</h2>
                {t.description && <p className="text-[13px] text-muted-foreground">{t.description}</p>}
              </div>
              <span className="flex items-center gap-3 text-[13px] text-muted-foreground">
                {members.length} {members.length === 1 ? "executive" : "executives"}
                <StatusBadge active={t.isActive} />
              </span>
            </div>
            {members.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted-foreground">No executives in this team yet.</p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">{members.map((e) => <Row key={e.id} e={e} />)}</ul>
            )}
          </section>
        );
      })}

      {noTeam.length > 0 && (
        <section aria-labelledby="team-other" className="grid gap-3">
          <h2 id="team-other">Other executives</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">{noTeam.map((e) => <Row key={e.id} e={e} />)}</ul>
        </section>
      )}
    </>
  );
}
