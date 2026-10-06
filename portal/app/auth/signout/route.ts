import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, loginPath } from "@/lib/session-cookie";

// Server Components can't modify cookies, so an expired/revoked token found during
// rendering is sent here to clear the cookie before returning to the login screen.
export function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("role");
  const role = param === "EXECUTIVE" || param === "MANAGER" ? param : "ADMIN";
  const url = new URL(loginPath[role], request.url);
  if (request.nextUrl.searchParams.get("reason") === "expired") url.searchParams.set("expired", "1");
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
