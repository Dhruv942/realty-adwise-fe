import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, homePath, loginPath, parseSession } from "@/lib/session-cookie";
import type { Role } from "@/lib/types";

// Fast, optimistic gate before rendering. Layouts re-check the session and the backend
// enforces roles on every call, so this only decides where to send the browser.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const role: Role = pathname.startsWith("/executive") ? "EXECUTIVE" : pathname.startsWith("/manager") ? "MANAGER" : "ADMIN";
  const session = parseSession(request.cookies.get(SESSION_COOKIE)?.value);
  const onLogin = pathname === loginPath[role];

  if (onLogin) {
    return session?.user.role === role
      ? NextResponse.redirect(new URL(homePath[role], request.url))
      : NextResponse.next();
  }

  if (session?.user.role !== role) {
    const url = new URL(loginPath[role], request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/manager", "/manager/:path*", "/executive", "/executive/:path*"],
};
