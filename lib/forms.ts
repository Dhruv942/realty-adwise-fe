import "server-only";
import { unstable_rethrow } from "next/navigation";
import { ApiError } from "./api";
import type { FormState } from "./types";

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Empty optional inputs are sent as `null`, which the API accepts for "no value". */
export function strOrNull(formData: FormData, key: string): string | null {
  return str(formData, key) || null;
}

/** Copies non-secret fields back to the form so they survive an error. */
export function echo(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, str(formData, key)]));
}

/**
 * Turns an API failure into form state. Redirects (expired session) and unexpected
 * errors are rethrown so Next.js handles them.
 */
export function toFormState(error: unknown, values?: Record<string, string>): FormState {
  unstable_rethrow(error);
  if (!(error instanceof ApiError)) throw error;
  let message = error.message;
  if (error.status === 429) {
    const minutes = error.retryAfter ? Math.max(1, Math.ceil(error.retryAfter / 60)) : null;
    message = minutes
      ? `Too many login attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`
      : "Too many login attempts. Try again later.";
  } else if (error.status === 403) {
    message = "You don't have permission to do that.";
  }
  return { status: "error", message, fieldErrors: error.fieldErrors, values };
}
