// Shared by proxy.ts and server code, so it must not import next/headers or server-only.
import type { Role, SessionUser } from "./types";

export const SESSION_COOKIE = "ra_session";

export type Session = {
  token: string;
  user: SessionUser;
  /** Epoch milliseconds when the access token expires. */
  expiresAt: number;
};

export const loginPath: Record<Role, string> = {
  ADMIN: "/admin/login",
  MANAGER: "/manager/login",
  EXECUTIVE: "/executive/login",
};

export const homePath: Record<Role, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  EXECUTIVE: "/executive",
};

/** Reads the `exp` claim without verifying the signature. The backend stays the authority. */
export function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (!session.token || !session.user?.role || !(session.expiresAt > Date.now())) return null;
    return session;
  } catch {
    return null;
  }
}

/** Only allow same-area relative paths, so `?next=` can't become an open redirect. */
export function safeNext(next: unknown, role: Role): string {
  const home = homePath[role];
  if (typeof next !== "string" || next.startsWith("//") || next.includes("\\")) return home;
  if (next === home || next.startsWith(`${home}/`)) {
    return next === loginPath[role] ? home : next;
  }
  return home;
}
