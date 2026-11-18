"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  assignExecutiveManager,
  createExecutive,
  deleteExecutive,
  getExecutive,
  removeExecutiveManager,
  resetExecutivePassword,
  setExecutiveStatus,
  updateExecutive,
  type ExecutiveChanges,
} from "@/lib/admin";
import { echo, str, strOrNull, toFormState } from "@/lib/forms";
import type { Executive, FormState } from "@/lib/types";

const PROFILE_FIELDS = ["name", "email", "username", "phone"] as const;
const DESIGNATIONS = ["SALES_EXECUTIVE", "EXECUTIVE_MANAGER"];
const designationOf = (formData: FormData) => (DESIGNATIONS.includes(str(formData, "designation")) ? str(formData, "designation") : undefined);

function password(formData: FormData, key = "password"): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createExecutiveAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, [...PROFILE_FIELDS, "managerId", "designation"]);
  let executive: Executive;
  try {
    executive = await createExecutive({
      name: values.name,
      email: values.email.toLowerCase(),
      username: values.username.toLowerCase(),
      password: password(formData),
      phone: values.phone || null,
      managerId: values.managerId || null,
      designation: designationOf(formData),
    });
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/executives/${executive.id}?created=1`);
}

export async function updateExecutiveAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, [...PROFILE_FIELDS, "designation"]);
  try {
    const current = await getExecutive(id);
    const next: Required<ExecutiveChanges> = {
      name: values.name,
      email: values.email.toLowerCase(),
      username: values.username.toLowerCase(),
      phone: strOrNull(formData, "phone"),
      designation: (designationOf(formData) ?? current.designation ?? "SALES_EXECUTIVE") as Required<ExecutiveChanges>["designation"],
    };
    // The API needs at least one field and checks uniqueness, so only send what changed.
    const changes = Object.fromEntries(
      ([...PROFILE_FIELDS, "designation"] as const).filter((key) => next[key] !== (current[key] ?? null)).map((key) => [key, next[key]]),
    ) as ExecutiveChanges;
    if (Object.keys(changes).length === 0) return { status: "idle" };

    await updateExecutive(id, changes);
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Executive updated." };
}

export async function resetPasswordAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const value = password(formData);
  if (value !== password(formData, "confirm")) {
    return { status: "error", fieldErrors: { confirm: "Passwords don't match" } };
  }
  try {
    await resetExecutivePassword(id, value);
  } catch (error) {
    return toFormState(error);
  }
  return { status: "success", message: "Password reset. The executive's existing sessions have been signed out." };
}

export async function setExecutiveStatusAction(id: string, isActive: boolean): Promise<FormState> {
  try {
    await setExecutiveStatus(id, isActive);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: isActive ? "Executive activated." : "Executive deactivated." };
}

export async function assignManagerAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const managerId = str(formData, "managerId");
  if (!managerId) return { status: "error", fieldErrors: { managerId: "Choose a manager" } };
  try {
    await assignExecutiveManager(id, managerId);
  } catch (error) {
    return toFormState(error, { managerId });
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Manager assigned." };
}

export async function removeManagerAction(id: string): Promise<FormState> {
  try {
    await removeExecutiveManager(id);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Manager removed." };
}

export async function deleteExecutiveAction(id: string): Promise<FormState> {
  try {
    await deleteExecutive(id);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/executives?deleted=1");
}
