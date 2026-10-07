"use client";

import { Bell, Clock, UserCheck, UserPlus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import type { NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRealtime } from "./RealtimeProvider";

const ICON: Record<NotificationType, typeof Bell> = {
  LEAD_CREATED: UserPlus,
  LEAD_ASSIGNED: UserCheck,
  LEAD_REASSIGNED: RefreshCw,
  LEAD_STATUS_UPDATED: RefreshCw,
  SLA_WARNING: Clock,
  SLA_EXPIRED: Clock,
};

export function NotificationBell() {
  const { notifications, unreadCount, connected, leadHref, markRead, markAllRead } = useRealtime();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative grid size-11 place-items-center rounded-lg text-foreground hover:bg-muted sm:size-9"
      >
        <Bell className="size-5 sm:size-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white sm:right-0 sm:top-0">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" className="fixed inset-x-2 top-14 z-50 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-display text-[15px] font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">{connected ? "Live" : "Reconnecting…"}</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-[13px] font-medium text-foreground underline-offset-2 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-[70dvh] divide-y divide-border overflow-y-auto sm:max-h-96">
              {notifications.map((n) => {
                const Icon = ICON[n.type] ?? Bell;
                const warn = n.type === "SLA_WARNING" || n.type === "SLA_EXPIRED";
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.isRead) markRead(n.id);
                        setOpen(false);
                        router.push(leadHref(n.entityId));
                      }}
                      className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50", !n.isRead && "bg-muted/30")}
                    >
                      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", warn ? "bg-warning-soft text-warning" : "bg-muted text-foreground")}>
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{n.title}</span>
                        <span className="block text-[13px] text-muted-foreground">{n.message}</span>
                        <span className="mt-0.5 block text-xs text-subtle">{formatDate(n.createdAt)}</span>
                      </span>
                      {!n.isRead && <span aria-label="Unread" className="mt-2 size-2 shrink-0 rounded-full bg-accent-ink" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
