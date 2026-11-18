"use client";

import { AlarmClock } from "lucide-react";
import { useEffect, useState } from "react";
import { followUpLabel, followUpState } from "@/lib/follow-up";
import type { FollowUpState, LeadFollowUp } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLE: Record<FollowUpState, string> = {
  OVERDUE: "border-destructive/40 bg-destructive-soft text-destructive",
  TODAY: "border-warning/40 bg-warning-soft text-warning",
  UPCOMING: "border-border bg-muted text-foreground",
};

/** Text plus color, never color alone. Re-evaluated every minute so it stays right on a long-open screen. */
export function FollowUpBadge({ followUp, className }: { followUp: Pick<LeadFollowUp, "at">; className?: string }) {
  // Start from the server-rendered clock-free value, then correct on the client to avoid a hydration mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  const state = followUpState(followUp.at, now);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[11px] font-semibold", STYLE[state], className)}>
      <AlarmClock className="size-3" aria-hidden="true" />
      {state === "OVERDUE" ? "Overdue" : followUpLabel(followUp.at, state)}
    </span>
  );
}
