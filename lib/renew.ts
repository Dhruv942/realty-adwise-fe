// Shared by proxy.ts and route handlers, so it must not import next/headers or server-only.
import type { LoginResponse, Role, SessionUser } from "./types";

export type Renewal =
  | { status: "renewed"; accessToken: string; refreshToken: string; user: SessionUser }
  /** The backend said no (expired, revoked, deactivated, password changed): the session is over. */
  | { status: "rejected" }
  /** Could not reach the backend: say nothing about the session, try again on the next request. */
  | { status: "unavailable" };

/** Exchanges the refresh token for a new access token through the backend's POST /auth/refresh. */
export async function renewWithRefreshToken(refreshToken: string): Promise<Renewal> {
  const base = process.env.API_BASE_URL?.replace(/\/$/, "");
  if (!base) return { status: "unavailable" };
  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (res.status === 401 || res.status === 400) return { status: "rejected" };
    if (!res.ok) return { status: "unavailable" };
    const data = (await res.json()) as LoginResponse & { refreshToken?: string };
    if (!data.accessToken || !data.refreshToken || !data.user) return { status: "unavailable" };
    const role: Role = data.user.role === "SALES" ? "EXECUTIVE" : data.user.role;
    return { status: "renewed", accessToken: data.accessToken, refreshToken: data.refreshToken, user: { ...data.user, role } };
  } catch {
    return { status: "unavailable" };
  }
}
