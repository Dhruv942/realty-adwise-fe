"use server";

import { revalidatePath } from "next/cache";
import { getCustomer, updateCustomer } from "@/lib/admin";
import { echo, strOrNull, toFormState } from "@/lib/forms";
import type { FormState } from "@/lib/types";

export async function updateCustomerAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, ["name", "email"]);
  try {
    const current = await getCustomer(id);
    const email = strOrNull(formData, "email");
    const changes: { name?: string; email?: string | null } = {};
    if (values.name !== current.name) changes.name = values.name;
    if (email !== current.email) changes.email = email;
    if (Object.keys(changes).length === 0) return { status: "idle" };
    await updateCustomer(id, changes);
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Client updated." };
}
