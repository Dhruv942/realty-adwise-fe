import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { FieldErrors, Role } from "./types";

const BASE_URL = (process.env.API_BASE_URL ?? "https://reality-dewise.onrender.com/api/v1").replace(/\/$/, "");

// Render's free tier can take ~30s to wake up, so allow well beyond that.
const TIMEOUT_MS = 60_000;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: FieldErrors,
    /** Seconds until the login rate limit resets, when the backend tells us. */
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | undefined>;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  token?: string;
};

function retryAfterSeconds(headers: Headers): number | undefined {
  const reset = headers.get("ratelimit")?.match(/reset=(\d+)/)?.[1] ?? headers.get("retry-after");
  const seconds = reset ? Number(reset) : NaN;
  return Number.isFinite(seconds) ? seconds : undefined;
}

export async function apiRequest<T>(path: string, { method = "GET", body, query, token }: RequestOptions = {}): Promise<T> {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(503, "Couldn't reach the server. It may be waking up, so try again in a moment.");
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined;
    }
  }

  if (!res.ok) {
    const payload = (data ?? {}) as { message?: string; errors?: { field: string; message: string }[] };
    const fieldErrors = payload.errors?.length
      ? Object.fromEntries(payload.errors.map((e) => [e.field, e.message]))
      : undefined;
    throw new ApiError(
      res.status,
      payload.message ?? `Request failed (${res.status})`,
      fieldErrors,
      res.status === 429 ? retryAfterSeconds(res.headers) : undefined,
    );
  }

  return data as T;
}

/**
 * Authenticated call for the given role. A 401 means the token expired, was revoked or the
 * user was deactivated, so the session is dropped and the user is sent back to login.
 */
export async function authedRequest<T>(role: Role, path: string, options: Omit<RequestOptions, "token"> = {}): Promise<T> {
  const session = await getSession();
  const signout = `/auth/signout?role=${role}&reason=expired`;
  if (!session || session.user.role !== role) redirect(signout);
  try {
    return await apiRequest<T>(path, { ...options, token: session.token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(signout);
    throw error;
  }
}
