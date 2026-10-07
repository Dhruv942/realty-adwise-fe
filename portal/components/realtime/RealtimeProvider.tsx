"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { listNotificationsAction, markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";
import type { AppNotification, SessionUser } from "@/lib/types";

const AUTH_ERRORS = ["Authentication token missing", "Invalid token", "Token expired", "Session expired, please log in again", "Authentication failed"];
const LEAD_EVENTS = ["lead:created", "lead:assigned", "lead:reassigned", "lead:status-updated", "lead:sla-warning", "lead:sla-expired"] as const;
const AREA = { ADMIN: "admin", MANAGER: "manager", EXECUTIVE: "executive" } as const;

type Toast = { id: number; title: string; message: string; href: string; tone: "info" | "warn" };

type Realtime = {
  connected: boolean;
  unreadCount: number;
  notifications: AppNotification[];
  leadHref: (leadId: string) => string;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const Ctx = createContext<Realtime | null>(null);

export function useRealtime(): Realtime {
  const value = useContext(Ctx);
  if (!value) throw new Error("useRealtime must be used inside RealtimeProvider");
  return value;
}

/**
 * One socket for the whole signed-in session. Socket events only say "something changed":
 * lists and details are re-fetched from the server, so the REST data stays the source of truth.
 */
export function RealtimeProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const role = user.role;
  const leadHref = useCallback((leadId: string) => `/${AREA[role]}/leads/${leadId}`, [role]);

  const refreshSoon = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    // Several events usually arrive together (created + assigned), so refresh once.
    refreshTimer.current = setTimeout(() => router.refresh(), 400);
  }, [router]);

  const loadNotifications = useCallback(async () => {
    const result = await listNotificationsAction(role);
    setNotifications(result.notifications);
    setUnreadCount(result.unreadCount);
  }, [role]);

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;
    const signOut = () => {
      window.location.href = `/auth/signout?role=${role}&reason=expired`;
    };

    async function fetchToken(): Promise<{ token: string; origin: string } | null> {
      try {
        const res = await fetch("/auth/socket-token", { cache: "no-store" });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    }

    (async () => {
      const first = await fetchToken();
      if (!first) console.warn("[realtime] could not get a socket token from /auth/socket-token");
      if (cancelled || !first) return;
      socket = io(first.origin, {
        // A function, so every automatic reconnect uses the current token.
        auth: (cb) => {
          fetchToken().then((t) => cb({ token: t?.token ?? first.token }));
        },
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        setConnected(true);
        // Events missed while offline are not replayed, so resync from REST.
        loadNotifications();
        router.refresh();
      });
      socket.on("disconnect", (reason) => {
        setConnected(false);
        // The server closes sockets when an account is deactivated or its password changes, and the client
        // does not retry on its own after that. Reconnect once: a revoked session fails auth and signs out.
        if (reason === "io server disconnect") socket?.connect();
      });
      socket.on("connect_error", (err) => {
        setConnected(false);
        console.warn("[realtime] connect_error:", err.message);
        if (AUTH_ERRORS.includes(err.message)) signOut();
      });
      socket.on("auth:expired", signOut);

      for (const event of LEAD_EVENTS) socket.on(event, refreshSoon);

      socket.on("notification:new", (n: AppNotification) => {
        setNotifications((list) => [n, ...list.filter((x) => x.id !== n.id)].slice(0, 30));
        if (!n.isRead) setUnreadCount((c) => c + 1);
        setToast({ id: Date.now(), title: n.title, message: n.message, href: leadHref(n.entityId), tone: n.type.startsWith("SLA_") ? "warn" : "info" });
      });
    })();

    return () => {
      cancelled = true;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      socket?.removeAllListeners();
      socket?.disconnect();
    };
  }, [role, router, leadHref, loadNotifications, refreshSoon]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.tone === "warn" ? 12000 : 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const markRead = useCallback(
    (id: string) => {
      setNotifications((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - (notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0)));
      markNotificationReadAction(role, id);
    },
    [role, notifications],
  );

  const markAllRead = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    markAllNotificationsReadAction(role);
  }, [role]);

  const value = useMemo(
    () => ({ connected, unreadCount, notifications, leadHref, markRead, markAllRead }),
    [connected, unreadCount, notifications, leadHref, markRead, markAllRead],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role={toast.tone === "warn" ? "alert" : "status"} style={toast.tone === "warn" ? { borderLeftColor: "var(--warning)" } : undefined}>
          <a
            href={toast.href}
            className="grid min-w-0 gap-0.5 no-underline"
            onClick={(e) => {
              e.preventDefault();
              router.push(toast.href);
              setToast(null);
            }}
          >
            <span className="font-semibold">{toast.title}</span>
            <span className="text-[13px] font-normal text-muted-foreground">{toast.message}</span>
          </a>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}
