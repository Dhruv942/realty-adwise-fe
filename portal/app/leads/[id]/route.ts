import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, homePath, parseSession } from "@/lib/session-cookie";

// Target of a push notification tap. The push carries only a lead id, so this sends the user to the lead
// inside their own area, or to the start page (where they pick their login) when signed out.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = parseSession(request.cookies.get(SESSION_COOKIE)?.value);
  const target = session ? `${homePath[session.user.role]}/leads/${encodeURIComponent(id)}` : "/";
  return NextResponse.redirect(new URL(target, request.url));
}
