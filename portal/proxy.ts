import { NextResponse, type NextRequest } from "next/server";
import { renewWithRefreshToken } from "@/lib/renew";
import {
  LOGIN_PATH,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  cookieOptions,
  homePath,
  parseSession,
  sessionCookies,
  sessionState,
  type CookieSpec,
  type Session,
} from "@/lib/session-cookie";
import type { Role } from "@/lib/types";

// Fast gate before rendering, and the one place a session is kept alive: when the access token is missing,
// expired or about to expire and a refresh token exists, it is renewed through the backend and the new cookies
// are used for this very request. Layouts re-check the session and the backend enforces roles on every call,
// so this only decides where to send the browser.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionRaw = request.cookies.get(SESSION_COOKIE)?.value;
  const refreshRaw = request.cookies.get(REFRESH_COOKIE)?.value;

  let session: Session | null = parseSession(sessionRaw);
  let fresh: CookieSpec[] = [];
  let ended = false; // the session is over (refused, expired for good, or unusable cookies): clear them

  const state = sessionState(sessionRaw, refreshRaw);
  if (state === "renew" && refreshRaw) {
    const r = await renewWithRefreshToken(refreshRaw);
    if (r.status === "renewed") {
      fresh = sessionCookies(r);
      session = parseSession(fresh[0].value);
    } else if (r.status === "rejected") {
      session = null;
      ended = true;
    }
    // "unavailable": keep whatever we had; the next request tries again.
  } else if (state === "none" && (sessionRaw || refreshRaw)) {
    // Cookies are present but neither is usable (expired for good, tampered): drop them instead of keeping dead cookies.
    ended = true;
  }

  // Carry cookie changes on whatever response goes out, and make them visible to this request's page render.
  const finish = (response: NextResponse) => {
    for (const c of fresh) response.cookies.set(c.name, c.value, cookieOptions(c.maxAge));
    if (ended) {
      response.cookies.delete(SESSION_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
    }
    return response;
  };
  const next = () => {
    if (fresh.length === 0) return finish(NextResponse.next());
    for (const c of fresh) request.cookies.set(c.name, c.value);
    return finish(NextResponse.next({ request: { headers: request.headers } }));
  };
  const to = (path: string) => finish(NextResponse.redirect(new URL(path, request.url)));
  const toLogin = (withNext: boolean) => {
    const url = new URL(LOGIN_PATH, request.url);
    if (withNext) url.searchParams.set("next", pathname + search);
    if (ended) url.searchParams.set("expired", "1");
    return finish(NextResponse.redirect(url));
  };

  // The old per-role sign-in URLs (/admin/login ...) now all lead to the single login page.
  if (/^\/(admin|manager|executive)\/login\/?$/.test(pathname)) {
    return session ? to(homePath[session.user.role]) : toLogin(false);
  }

  // A valid session never sees the login page.
  if (pathname === LOGIN_PATH) return session ? to(homePath[session.user.role]) : next();

  const area: Role = pathname.startsWith("/executive") ? "EXECUTIVE" : pathname.startsWith("/manager") ? "MANAGER" : "ADMIN";
  if (!session) return toLogin(true);
  // Signed in, but this area belongs to another role: send them to their own dashboard.
  if (session.user.role !== area) return to(homePath[session.user.role]);

  return next();
}

export const config = {
  matcher: ["/login", "/admin", "/admin/:path*", "/manager", "/manager/:path*", "/executive", "/executive/:path*"],
};
