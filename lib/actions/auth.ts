"use server";

import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { echo, str, toFormState } from "@/lib/forms";
import { clearSession, setSession } from "@/lib/session";
import { LOGIN_PATH, safeNext } from "@/lib/session-cookie";
import type { FormState, LoginResponse, Role } from "@/lib/types";

/** Email + password only. The role is whatever the backend reports for the account; nothing role-related is sent. */
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, ["email"]);
  const email = values.email.toLowerCase();
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";

  let result: LoginResponse;
  try {
    result = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    return toFormState(error, values);
  }

  // The backend's SALES role is the portal's EXECUTIVE area.
  const role: Role = result.user.role === "SALES" ? "EXECUTIVE" : result.user.role;

  await setSession(result.accessToken, { ...result.user, role }, result.refreshToken);
  redirect(safeNext(str(formData, "next"), role));
}

export async function logout() {
  await clearSession();
  redirect(LOGIN_PATH);
}
