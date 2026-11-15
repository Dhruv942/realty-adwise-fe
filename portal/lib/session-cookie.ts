// Shared by proxy.ts and server code, so it must not import next/headers or server-only.
import type { Role, SessionUser } from "./types";

export const SESSION_COOKIE = "ra_session";
/** The refresh token. httpOnly like the session cookie: the browser's JavaScript never sees either token. */
export const REFRESH_COOKIE = "ra_refresh";
/** Renew the access token this long before it expires, so a request never reaches the API with a dying token. */
export const RENEW_MARGIN_MS = 2 * 60 * 1000;

export type Session = {
  token: string;
  user: SessionUser;
  /** Epoch milliseconds when the access token expires. */
  expiresAt: number;
};

/** One sign-in page for everyone: the backend decides the role from the account. */
export const LOGIN_PATH = "/login";
export const loginPath: Record<Role, string> = { ADMIN: LOGIN_PATH, MANAGER: LOGIN_PATH, EXECUTIVE: LOGIN_PATH };

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

export function parseSession(raw: string | undefined, now = Date.now()): Session | null {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (!session.token || !session.user?.role || !(session.expiresAt > now)) return null;
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

export type SessionState =
  /** Signed in and the access token is good for a while. */
  | "valid"
  /** Not usable as is, but a refresh token exists: ask the backend for a new access token. */
  | "renew"
  /** Not signed in. */
  | "none";

/** Pure decision used by the proxy: what to do with the cookies a request arrived with. */
export function sessionState(sessionRaw: string | undefined, refreshRaw: string | undefined, now = Date.now()): SessionState {
  const session = parseSession(sessionRaw, now);
  if (session && session.expiresAt - now > RENEW_MARGIN_MS) return "valid";
  const refreshExp = refreshRaw ? tokenExpiry(refreshRaw) : null;
  if (refreshExp && refreshExp > now) return "renew";
  return session ? "valid" : "none";
}

export type CookieSpec = { name: string; value: string; maxAge: number };

/**
 * The two cookies for a login or a renewal. Both outlive the 1h access token (they last until the refresh
 * token's absolute expiry), which is what keeps people signed in across browser restarts. They are never
 * given a Domain, so they belong to this host only; Secure over HTTPS in production, SameSite=Lax.
 */
export function sessionCookies(result: { accessToken: string; refreshToken?: string; user: SessionUser }, now = Date.now()): CookieSpec[] {
  const expiresAt = tokenExpiry(result.accessToken) ?? now + 60 * 60 * 1000;
  const refreshExp = result.refreshToken ? tokenExpiry(result.refreshToken) : null;
  const lifetimeMs = Math.max(0, (refreshExp ?? expiresAt) - now);
  const session: Session = { token: result.accessToken, user: result.user, expiresAt };
  const cookies: CookieSpec[] = [{ name: SESSION_COOKIE, value: JSON.stringify(session), maxAge: Math.floor(lifetimeMs / 1000) }];
  if (result.refreshToken && refreshExp) cookies.push({ name: REFRESH_COOKIE, value: result.refreshToken, maxAge: Math.floor(lifetimeMs / 1000) });
  return cookies;
}

export const cookieOptions = (maxAge: number) =>
  ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge }) as const;
