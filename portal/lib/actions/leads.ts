"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createLead, setLeadStatus, type NewLead } from "@/lib/admin";
import { setMyLeadStatus } from "@/lib/executive";
import { echo, str, toFormState } from "@/lib/forms";
import type { FormState } from "@/lib/types";

const FIELDS = ["name", "mobile", "email", "propertyName", "source", "budget", "message", "externalLeadId", "requirement", "customerType"];

export async function createLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, FIELDS);
  const budgetRaw = values.budget.replace(/[,\s]/g, "");
  if (budgetRaw && !/^\d+(\.\d+)?$/.test(budgetRaw)) {
    return { status: "error", fieldErrors: { budget: "Enter the budget in rupees, numbers only" }, values };
  }
  const body: NewLead = {
    name: values.name,
    mobile: values.mobile,
    propertyName: values.propertyName,
    source: values.source,
  };
  if (values.email) body.email = values.email;
  if (budgetRaw) body.budget = Number(budgetRaw);
  if (values.requirement) body.requirement = values.requirement;
  if (values.customerType) body.customerType = values.customerType;
  if (values.message) body.message = values.message;
  if (values.externalLeadId) body.externalLeadId = values.externalLeadId;

  let id: string;
  try {
    id = (await createLead(body)).id;
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/leads/${id}?created=1`);
}

export async function updateLeadStatusAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const status = str(formData, "status");
  try {
    await setLeadStatus(id, status);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Status updated." };
}

export async function updateMyLeadStatusAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await setMyLeadStatus(id, str(formData, "status"));
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/executive", "layout");
  return { status: "success", message: "Status updated." };
}
