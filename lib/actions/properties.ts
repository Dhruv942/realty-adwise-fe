"use server";

import { revalidatePath } from "next/cache";
import { getProperty, setPropertyExecutives, setPropertyStatus, updateProperty, type PropertyChanges } from "@/lib/admin";
import { echo, strOrNull, toFormState } from "@/lib/forms";
import type { FormState } from "@/lib/types";

export async function updatePropertyAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, ["name", "description", "location"]);
  try {
    const current = await getProperty(id);
    const next = { name: values.name, description: strOrNull(formData, "description"), location: strOrNull(formData, "location") };
    const changes: PropertyChanges = {};
    if (next.name !== current.name) changes.name = next.name;
    if (next.description !== current.description) changes.description = next.description;
    if (next.location !== current.location) changes.location = next.location;
    if (Object.keys(changes).length === 0) return { status: "idle" };
    await updateProperty(id, changes);
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Property updated." };
}

export async function setPropertyStatusAction(id: string, isActive: boolean): Promise<FormState> {
  try {
    await setPropertyStatus(id, isActive);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: isActive ? "Property activated." : "Property deactivated." };
}

/** The full list is replaced every time, so unchecked executives are removed. */
export async function setExecutivesAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const executiveIds = formData.getAll("executiveIds").filter((v): v is string => typeof v === "string" && v !== "");
  try {
    const result = await setPropertyExecutives(id, executiveIds);
    revalidatePath("/admin", "layout");
    const n = result.assignedPendingLeads ?? 0;
    return {
      status: "success",
      message: `Saved ${executiveIds.length} executive${executiveIds.length === 1 ? "" : "s"}.${n ? ` ${n} pending lead${n === 1 ? " was" : "s were"} assigned.` : ""}`,
    };
  } catch (error) {
    return toFormState(error);
  }
}
