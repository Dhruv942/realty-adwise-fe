import type { ActivityEntry } from "@/lib/types";

const time = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
const dayLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/** "3:54 pm" for today, "6 Oct, 3:54 pm" for earlier days. */
function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const t = time.format(d).toLowerCase();
  return day.format(d) === day.format(new Date()) ? t : `${dayLabel.format(d)}, ${t}`;
}

/** What happened to a lead, oldest first. Every row is stored by the backend, so a refresh shows the same list. */
export function ActivityTimeline({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) return <p className="muted">No activity recorded yet.</p>;
  return (
    <ol className="relative grid gap-5 pl-5">
      <span aria-hidden="true" className="absolute bottom-1 left-[3px] top-1.5 w-px bg-border" />
      {activity.map((a) => (
        <li key={a.id} className="relative">
          <span aria-hidden="true" className="absolute -left-5 top-[5px] size-[7px] rounded-full bg-[#6366f1]" />
          <p className="text-xs text-muted-foreground">{when(a.createdAt)}</p>
          <p className="text-sm">{a.message}</p>
        </li>
      ))}
    </ol>
  );
}
