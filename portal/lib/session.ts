import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, loginPath, parseSession, tokenExpiry, type Session } from "./session-cookie";
import type { Role, SessionUser } from "./types";

const FALLBACK_TTL_MS = 60 * 60 * 1000;

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}

/** Use in layouts and pages. Redirects to the right login screen when the session is missing or for another role. */
export async function requireSession(role: Role): Promise<Session> {
  const session = await getSession();
  if (!session || session.user.role !== role) redirect(loginPath[role]);
  return session;
}

/** Server actions / route handlers only. */
export async function setSession(token: string, user: SessionUser) {
  const expiresAt = tokenExpiry(token) ?? Date.now() + FALLBACK_TTL_MS;
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify({ token, user, expiresAt } satisfies Session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  });
}

/** Server actions / route handlers only. */
export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
