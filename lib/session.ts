import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { REFRESH_COOKIE, SESSION_COOKIE, cookieOptions, loginPath, parseSession, sessionCookies, type Session } from "./session-cookie";
import type { Role, SessionUser } from "./types";

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

/** Server actions / route handlers only. Stores the session (and the refresh token, when there is one) as httpOnly cookies. */
export async function setSession(token: string, user: SessionUser, refreshToken?: string) {
  const store = await cookies();
  for (const c of sessionCookies({ accessToken: token, refreshToken, user })) store.set(c.name, c.value, cookieOptions(c.maxAge));
}

/** Server actions / route handlers only. */
export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_COOKIE);
}
