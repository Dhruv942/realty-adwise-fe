"use client";

import { Clock, MessageCircle, Phone, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { setImportantAction } from "@/lib/actions/leads";
import { SlaClock } from "@/components/SlaClock";
import { formatBudget, formatDate, whatsappUrl } from "@/lib/format";
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

  const meta = [lead.requirement, lead.budget != null ? formatBudget(lead.budget) : null].filter(Boolean).join(" · ");

  return (
    <article className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 px-4 py-3.5 transition-colors hover:bg-muted/40 md:grid-cols-[minmax(0,1fr)_9.5rem_auto]">
      {important && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-warning" />}
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
        className="col-span-2 block min-w-0 select-none rounded-md no-underline [-webkit-touch-callout:none] md:col-span-1"
      >
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="min-w-0 truncate !font-sans !text-[15px] !font-medium !tracking-normal">{lead.customer.name}</h2>
          <span className="num text-xs text-muted-foreground">#{lead.leadNo}</span>
          <span className="self-center md:hidden">
            <LeadStatusBadge status={lead.status} />
          </span>
          {lead.isNew && <span className="tag-new !ml-0">New</span>}
          {important && (
            <span className="inline-flex items-center gap-1 self-center text-xs font-medium text-warning">
              <Star className="size-3 fill-current" aria-hidden="true" />
              Important
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          <span className="text-foreground">{lead.property.name}</span>
          {lead.property.location ? `, ${lead.property.location}` : ""}
          {meta && ` · ${meta}`}
        </p>
        <SlaClock variant="chip" sla={lead.sla} role={role} executiveName={lead.assignedExecutive?.name} />
        <p className="mt-1 text-xs text-muted-foreground">
          {lead.source}
          {showExecutive && <> · {lead.assignedExecutive ? lead.assignedExecutive.name : "Unassigned"}</>}
          {" · "}
          {formatDate(lead.assignedAt ?? lead.createdAt)}
        </p>
      </Link>

      <div className="hidden min-w-0 md:block">
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="col-span-2 flex items-center gap-1.5 md:col-span-1 md:justify-end">
        <a
          href={`tel:${lead.customer.mobile}`}
          aria-label={`Call ${lead.customer.name}`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-surface px-2.5 text-[13px] font-medium no-underline transition-colors hover:bg-muted md:h-9 md:flex-none"
        >
          <Phone className="size-4" aria-hidden="true" /> Call
        </a>
        <a
          href={whatsappUrl(lead.customer.mobile)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${lead.customer.name} (opens in a new tab)`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-input bg-surface px-2.5 text-[13px] font-medium no-underline transition-colors hover:bg-muted md:h-9 md:flex-none"
        >
          <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
        </a>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={important}
          aria-label={important ? `Remove ${lead.customer.name} from important` : `Mark ${lead.customer.name} as important`}
          data-tip={important ? "Remove from important" : "Mark as important"}
          className={cn("tip tip-left grid size-10 shrink-0 place-items-center md:size-9 rounded-lg transition-colors hover:bg-muted", important ? "text-warning" : "text-muted-foreground hover:text-foreground")}
        >
          <Star className={cn("size-4", important && "fill-current")} aria-hidden="true" />
        </button>
      </div>

      {(note || error) && (
        <p role={error ? "alert" : "status"} className={cn("col-span-full text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {error ?? note}
        </p>
      )}
    </article>
  );
}
