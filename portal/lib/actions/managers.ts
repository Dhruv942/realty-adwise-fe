"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createManager,
  deleteManager,
  getManager,
  resetManagerPassword,
  setManagerStatus,
  updateManager,
  type ManagerChanges,
} from "@/lib/admin";
import { echo, strOrNull, toFormState } from "@/lib/forms";
import type { FormState, Manager } from "@/lib/types";

const FIELDS = ["name", "email", "username", "phone"] as const;

const pw = (formData: FormData, key = "password") => (typeof formData.get(key) === "string" ? (formData.get(key) as string) : "");

export async function createManagerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, [...FIELDS]);
  let manager: Manager;
  try {
    manager = await createManager({
      name: values.name,
      email: values.email.toLowerCase(),
      username: values.username.toLowerCase(),
      password: pw(formData),
      phone: values.phone || null,
    });
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/managers/${manager.id}?created=1`);
}

export async function updateManagerAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, [...FIELDS]);
  try {
    const current = await getManager(id);
    const next: Required<ManagerChanges> = {
      name: values.name,
      email: values.email.toLowerCase(),
      username: values.username.toLowerCase(),
      phone: strOrNull(formData, "phone"),
    };
    const changes = Object.fromEntries(FIELDS.filter((k) => next[k] !== (current[k] ?? null)).map((k) => [k, next[k]])) as ManagerChanges;
    if (Object.keys(changes).length === 0) return { status: "idle" };
    await updateManager(id, changes);
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Manager updated." };
}

export async function resetManagerPasswordAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const value = pw(formData);
  if (value !== pw(formData, "confirm")) return { status: "error", fieldErrors: { confirm: "Passwords don't match" } };
  try {
    await resetManagerPassword(id, value);
  } catch (error) {
    return toFormState(error);
  }
  return { status: "success", message: "Password reset. Their existing sessions have been signed out." };
}

export async function setManagerStatusAction(id: string, isActive: boolean): Promise<FormState> {
  try {
    await setManagerStatus(id, isActive);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: isActive ? "Manager activated." : "Manager deactivated." };
}

export async function deleteManagerAction(id: string): Promise<FormState> {
  try {
    await deleteManager(id);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/managers?deleted=1");
}
