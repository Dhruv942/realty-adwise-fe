import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, REFRESH_COOKIE, SESSION_COOKIE } from "@/lib/session-cookie";

// Server Components can't modify cookies, so a session the backend rejected during rendering is sent here
// to clear both cookies before returning to the login screen.
export function GET(request: NextRequest) {
  const url = new URL(LOGIN_PATH, request.url);
  if (request.nextUrl.searchParams.get("reason") === "expired") url.searchParams.set("expired", "1");
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
