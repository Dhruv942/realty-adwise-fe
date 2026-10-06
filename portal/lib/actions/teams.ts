"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTeam, getTeam, setTeamStatus, updateTeam } from "@/lib/admin";
import { echo, str, strOrNull, toFormState } from "@/lib/forms";
import type { FormState, Team } from "@/lib/types";

const FIELDS = ["name", "description", "managerId"];

export async function createTeamAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, FIELDS);
  let team: Team;
  try {
    team = await createTeam({ name: str(formData, "name"), description: strOrNull(formData, "description"), managerId: strOrNull(formData, "managerId") });
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/teams/${team.id}?created=1`);
}

export async function updateTeamAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = echo(formData, FIELDS);
  try {
    const current = await getTeam(id);
    const changes: { name?: string; description?: string | null; managerId?: string | null } = {};
    const name = str(formData, "name");
    const description = strOrNull(formData, "description");
    if (name !== current.name) changes.name = name;
    if (description !== (current.description ?? null)) changes.description = description;
    const managerId = strOrNull(formData, "managerId");
    if (managerId !== (current.manager?.id ?? null)) changes.managerId = managerId;
    if (Object.keys(changes).length === 0) return { status: "idle" };

    await updateTeam(id, changes);
  } catch (error) {
    return toFormState(error, values);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Team updated." };
}

export async function setTeamStatusAction(id: string, isActive: boolean): Promise<FormState> {
  try {
    await setTeamStatus(id, isActive);
  } catch (error) {
    return toFormState(error);
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: isActive ? "Team activated." : "Team deactivated." };
}
