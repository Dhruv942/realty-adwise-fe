import { ArrowRightLeft, CircleAlert, Clock, Inbox, RefreshCw, UserCheck, type LucideIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { ActivityEntry, ActivityType } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLE: Record<ActivityType, { icon: LucideIcon; tone: string }> = {
  LEAD_RECEIVED: { icon: Inbox, tone: "bg-muted text-foreground" },
  ASSIGNED: { icon: UserCheck, tone: "bg-muted text-foreground" },
  SLA_STARTED: { icon: Clock, tone: "bg-muted text-muted-foreground" },
  STATUS_CHANGED: { icon: RefreshCw, tone: "bg-success-soft text-success" },
  SLA_BREACHED: { icon: CircleAlert, tone: "bg-destructive-soft text-destructive" },
  AUTO_REASSIGNED: { icon: ArrowRightLeft, tone: "bg-warning-soft text-warning" },
};

/** What happened to a lead, oldest first. Every row is stored by the backend, so a refresh shows the same list. */
export function ActivityTimeline({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) return <p className="muted">No activity recorded yet.</p>;
  return (
    <ol className="grid">
      {activity.map((a, i) => {
        const { icon: Icon, tone } = STYLE[a.type] ?? STYLE.LEAD_RECEIVED;
        return (
          <li key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < activity.length - 1 && <span aria-hidden="true" className="absolute left-4 top-8 bottom-0 w-px bg-border" />}
            <span className={cn("relative grid size-8 shrink-0 place-items-center rounded-full", tone)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium">{a.message}</p>
              <p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
