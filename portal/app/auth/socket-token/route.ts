import { NextResponse, type NextRequest } from "next/server";
import { renewWithRefreshToken } from "@/lib/renew";
import { REFRESH_COOKIE, SESSION_COOKIE, cookieOptions, parseSession, sessionCookies, sessionState } from "@/lib/session-cookie";

// Socket.IO connects from the browser, so it needs the access token. The cookie stays httpOnly:
// only a signed-in user can fetch the token, and only for the socket handshake. When the access token is
// about to expire it is renewed first (the proxy does not run for this path).
export async function GET(request: NextRequest) {
  const base = process.env.API_BASE_URL;
  const headers = { "Cache-Control": "no-store" };
  const sessionRaw = request.cookies.get(SESSION_COOKIE)?.value;
  const refreshRaw = request.cookies.get(REFRESH_COOKIE)?.value;
  let session = parseSession(sessionRaw);
  let renewed: ReturnType<typeof sessionCookies> | null = null;

  if (sessionState(sessionRaw, refreshRaw) === "renew" && refreshRaw) {
    const r = await renewWithRefreshToken(refreshRaw);
    if (r.status === "renewed") {
      renewed = sessionCookies(r);
      session = { token: r.accessToken, user: r.user, expiresAt: Date.now() + 60_000 };
    } else if (r.status === "rejected") {
      session = null;
    }
  }

  if (!session || !base) return NextResponse.json({ message: "Not signed in" }, { status: 401, headers });
  const response = NextResponse.json({ token: session.token, origin: new URL(base).origin, userId: session.user.id }, { headers });
  for (const c of renewed ?? []) response.cookies.set(c.name, c.value, cookieOptions(c.maxAge));
  return response;
}
