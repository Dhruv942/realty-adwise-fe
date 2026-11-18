"use server";

import { revalidatePath } from "next/cache";
import { setAssignmentRule, setLeadTimeout } from "@/lib/admin";
import { str, toFormState } from "@/lib/forms";
import type { FormState } from "@/lib/types";

export async function saveAssignmentRuleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const rule = str(formData, "rule");
  if (!rule) return { status: "error", fieldErrors: { rule: "Choose a rule" } };
  try {
    await setAssignmentRule(rule);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin/settings", "page");
  return { status: "success", message: "Saved. The new rule applies to the next lead." };
}

export async function saveLeadTimeoutAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = str(formData, "minutes");
  if (!/^\d+$/.test(raw)) return { status: "error", fieldErrors: { minutes: "Enter a whole number of minutes" }, values: { minutes: raw } };
  try {
    await setLeadTimeout(Number(raw));
  } catch (error) {
    return toFormState(error, { minutes: raw });
  }
  revalidatePath("/admin/settings", "page");
  return { status: "success", message: "Saved. The new time applies from the next check." };
}
