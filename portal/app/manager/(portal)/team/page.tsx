import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { listManagerExecutives, listManagerTeams } from "@/lib/manager";
import { DESIGNATION_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

export default async function ManagerTeamPage() {
  const [teams, executives] = await Promise.all([listManagerTeams(), listManagerExecutives()]);
  const noTeam = executives.filter((e) => !e.team || !teams.some((t) => t.id === e.team!.id));

  const Row = ({ e }: { e: (typeof executives)[number] }) => (
    <li className="border-b border-border last:border-0">
      <Link href={`/manager/leads?executiveId=${e.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-muted/60 sm:px-5">
        <span className="avatar" aria-hidden="true">
          {e.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate">{e.name}</span>
          <span className="block truncate text-sm text-muted-foreground">
            {e.designation ? DESIGNATION_LABEL[e.designation] : "Sales Executive"} · {e.email}
          </span>
        </span>
        <StatusBadge active={e.isActive} />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );

  return (
    <>
      <div>
        <p className="eyebrow">Manager</p>
        <h1>Team</h1>
        <p className="muted mt-1">Tap an executive to see their leads.</p>
      </div>

      {teams.length === 0 && <p className="empty panel">You don&apos;t lead any teams yet. Ask an admin to make you a team&apos;s manager.</p>}

      {teams.map((t) => {
        const members = executives.filter((e) => e.team?.id === t.id);
        return (
          <Card key={t.id} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
              <div>
                <h2 className="!text-lg">{t.name}</h2>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              </div>
              <StatusBadge active={t.isActive} />
            </div>
            {members.length === 0 ? <p className="px-4 py-8 text-center text-muted-foreground">No executives in this team yet.</p> : <ul>{members.map((e) => <Row key={e.id} e={e} />)}</ul>}
          </Card>
        );
      })}

      {noTeam.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-3 sm:px-5">
            <h2 className="!text-lg">Other executives</h2>
          </div>
          <ul>{noTeam.map((e) => <Row key={e.id} e={e} />)}</ul>
        </Card>
      )}
    </>
  );
}
