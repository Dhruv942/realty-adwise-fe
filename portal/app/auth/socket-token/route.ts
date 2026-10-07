import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Socket.IO connects from the browser, so it needs the access token. The cookie stays httpOnly:
// only a signed-in user can fetch the token, and only for the socket handshake.
export async function GET() {
  const session = await getSession();
  const base = process.env.API_BASE_URL;
  if (!session || !base) return NextResponse.json({ message: "Not signed in" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(
    { token: session.token, origin: new URL(base).origin, userId: session.user.id },
    { headers: { "Cache-Control": "no-store" } },
  );
}
