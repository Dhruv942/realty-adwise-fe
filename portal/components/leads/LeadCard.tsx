"use client";

import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { setImportantAction } from "@/lib/actions/leads";
import { formatBudget, formatDate, slaDeadline, whatsappUrl } from "@/lib/format";
import type { Lead, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const LONG_PRESS_MS = 550;
const MOVE_TOLERANCE = 10;

/** One lead. Long-press (or tap the star) toggles Important for the signed-in user. */
export function LeadCard({ lead, role, href, showExecutive = true }: { lead: Lead; role: Role; href: string; showExecutive?: boolean }) {
  const [important, setImportant] = useState(lead.isImportant);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  function toggle() {
    const next = !important;
    setImportant(next); // optimistic
    setError(null);
    startTransition(async () => {
      const result = await setImportantAction(role, lead.id, next);
      if (result.ok) {
        setImportant(result.isImportant);
        setNote(result.isImportant ? "Marked important" : "Removed from important");
      } else {
        setImportant(!next);
        setError(result.message);
      }
    });
  }

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 1800);
    return () => clearTimeout(t);
  }, [note]);

  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function start(event: React.PointerEvent) {
    if (event.pointerType === "mouse") return; // desktop uses the star button
    fired.current = false;
    origin.current = { x: event.clientX, y: event.clientY };
    timer.current = setTimeout(() => {
      fired.current = true;
      navigator.vibrate?.(15);
      toggle();
    }, LONG_PRESS_MS);
  }

  function move(event: React.PointerEvent) {
    if (!origin.current) return;
    if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > MOVE_TOLERANCE) cancel();
  }

  const deadline = role === "EXECUTIVE" ? slaDeadline(lead.status, lead.assignedAt) : null;
  const meta = [lead.requirement, lead.budget != null ? formatBudget(lead.budget) : null].filter(Boolean).join(" · ");

  return (
    <article
      className={cn(
        "relative rounded-2xl border bg-card transition-colors",
        important ? "border-amber-300 border-l-4 border-l-amber-400 bg-amber-50/50" : "border-border hover:border-border-strong",
        lead.isNew && !important && "border-l-4 border-l-success",
      )}
    >
      <Link
        href={href}
        prefetch={false}
        draggable={false}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          if (fired.current) {
            e.preventDefault(); // the press was a long-press, not a tap
            fired.current = false;
          }
        }}
        className="block select-none rounded-t-2xl p-4 no-underline [-webkit-touch-callout:none]"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs text-muted-foreground">#{lead.leadNo}</span>
          <LeadStatusBadge status={lead.status} />
          {lead.isNew && <span className="tag-new !ml-0">New</span>}
          {important && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-display text-[10px] uppercase tracking-[.14em] text-amber-800">Important</span>}
        </div>
        <h3 className="mt-2 truncate !font-normal !text-[17px] !tracking-normal">{lead.customer.name}</h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {lead.property.name}
          {lead.property.location ? `, ${lead.property.location}` : ""}
        </p>
        {meta && <p className="mt-1 text-sm">{meta}</p>}
        {deadline && <p className="mt-2 text-xs text-warning">Update the status by {deadline} or it moves to the next executive.</p>}
        <p className="mt-2 text-xs text-muted-foreground">
          {lead.source}
          {showExecutive && <> · {lead.assignedExecutive ? lead.assignedExecutive.name : "Unassigned"}</>}
          {" · "}
          {formatDate(lead.assignedAt ?? lead.createdAt)}
        </p>
      </Link>


      <div className="grid grid-cols-2 gap-2 border-t border-border p-2.5">
        <a
          href={`tel:${lead.customer.mobile}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-strong font-display text-xs uppercase tracking-[.16em] no-underline hover:bg-muted"
        >
          <Phone className="size-4" /> Call
        </a>
        <a
          href={whatsappUrl(lead.customer.mobile)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#128c4a] font-display text-xs uppercase tracking-[.16em] text-white no-underline hover:bg-[#0e7a3f]"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={important}
        className="hidden h-10 w-full items-center justify-center border-t border-border font-display text-[11px] uppercase tracking-[.16em] text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
      >
        {important ? "Remove from important" : "Mark as important"}
      </button>
      {note && !error && (
        <p role="status" className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {note}
        </p>
      )}
      {error && (
        <p role="alert" className="border-t border-border px-4 py-2 text-xs text-danger">
          {error}
        </p>
      )}
    </article>
  );
}
