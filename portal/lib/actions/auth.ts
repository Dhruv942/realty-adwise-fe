"use server";

import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { echo, str, toFormState } from "@/lib/forms";
import { clearSession, getSession, setSession } from "@/lib/session";
import { loginPath, safeNext } from "@/lib/session-cookie";
import type { FormState, LoginResponse, Role } from "@/lib/types";

const loginEndpoint: Record<Role, string> = {
  ADMIN: "/auth/admin/login",
  MANAGER: "/auth/manager/login",
  EXECUTIVE: "/auth/executive/login",
};

export async function login(role: Role, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, ["email"]);
  const email = values.email.toLowerCase();
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";

  let result: LoginResponse;
  try {
    result = await apiRequest<LoginResponse>(loginEndpoint[role], {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    return toFormState(error, values);
  }

  // The endpoints are role-specific, but don't trust that blindly when routing.
  const actual: Role = result.user.role === "SALES" ? "EXECUTIVE" : result.user.role;
  if (actual !== role) {
    return { status: "error", message: "Invalid email or password", values };
  }

  await setSession(result.accessToken, { ...result.user, role: actual });
  redirect(safeNext(str(formData, "next"), role));
}

export async function logout() {
  const role = (await getSession())?.user.role ?? "ADMIN";
  await clearSession();
  redirect(loginPath[role]);
}
