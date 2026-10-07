"use client";

import { useEffect, useState } from "react";
import { SLA_MINUTES, slaDeadline } from "@/lib/format";
import type { LeadStatus, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  status: LeadStatus;
  assignedAt: string | null;
  /** Response time in minutes. Defaults to the standard 90. */
  minutes?: number;
  role: Role;
  executiveName?: string | null;
  /** "chip" is a small pill for lead lists. "panel" is the large card on a lead page. */
  variant?: "chip" | "panel";
};

type Tone = "good" | "soon" | "late";

const TONE: Record<Tone, { text: string; soft: string; border: string; title: string }> = {
  good: { text: "text-success", soft: "bg-success-soft", border: "border-success/30", title: "On track" },
  soon: { text: "text-warning", soft: "bg-warning-soft", border: "border-warning/40", title: "Running low" },
  late: { text: "text-destructive", soft: "bg-destructive-soft", border: "border-destructive/40", title: "Almost out of time" },
};

function left(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m >= 10) return `${m} min`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Round clock face that empties as the response time is used up. */
function Ring({ fraction, tone, size }: { fraction: number; tone: Tone; size: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" className={cn("shrink-0 -rotate-90", TONE[tone].text)}>
      <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" className="stroke-current opacity-20" />
      <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-current transition-[stroke-dashoffset] duration-700" strokeDasharray={c} strokeDashoffset={c * (1 - fraction)} />
      {/* clock hands, turned back upright */}
      <g className="rotate-90 origin-center stroke-current" strokeWidth="2.2" strokeLinecap="round">
        <line x1="22" y1="22" x2="22" y2="13" />
        <line x1="22" y1="22" x2="28" y2="25" />
      </g>
    </svg>
  );
}

/** Countdown for a lead that is waiting for its first status change. Renders nothing once the lead has moved on. */
export function SlaClock({ status, assignedAt, minutes = SLA_MINUTES, role, executiveName, variant = "panel" }: Props) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const deadline = slaDeadline(status, assignedAt, minutes);
  if (!deadline || !assignedAt) return null;

  const total = minutes * 60_000;
  const end = new Date(assignedAt).getTime() + total;
  const remaining = now === null ? total : end - now;
  const fraction = Math.min(1, Math.max(0, remaining / total));
  const over = remaining <= 0;
  const tone: Tone = fraction > 0.5 ? "good" : fraction > 0.2 ? "soon" : "late";
  const t = TONE[tone];
  const who = role === "EXECUTIVE" ? "You" : (executiveName ?? "The executive");
  const timeText = now === null ? `by ${deadline}` : over ? "Time is up" : `${left(remaining)} left`;

  if (variant === "chip") {
    return (
      <span className={cn("mt-1.5 inline-flex items-center gap-2 rounded-full border py-0.5 pl-1 pr-3 text-xs font-medium", t.soft, t.border, t.text)} title={`Status must be updated by ${deadline}`}>
        <Ring fraction={fraction} tone={tone} size={26} />
        <span className="tabular-nums">{timeText}</span>
        <span className="font-normal text-muted-foreground">· update by {deadline}</span>
      </span>
    );
  }

  return (
    <section className={cn("flex items-center gap-4 rounded-xl border p-4", t.soft, t.border)} aria-label="Response time">
      <Ring fraction={fraction} tone={tone} size={64} />
      <div className="min-w-0">
        <p className={cn("text-xs font-semibold uppercase tracking-wide", t.text)}>{over ? "Time is up" : t.title}</p>
        <p className="num text-2xl font-semibold leading-tight text-foreground tabular-nums">{over ? "0:00" : left(remaining)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {over
            ? `${who} did not update the status in time. The lead will move to the next executive.`
            : `${who} must change the status by ${deadline}, or the lead moves to the next executive.`}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Opening the lead does not stop the clock. Only changing the status does.</p>
      </div>
    </section>
  );
}
