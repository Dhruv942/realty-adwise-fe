"use server";

import { ApiError } from "@/lib/api";
import { createNote, deleteNote, listNotes, updateNote } from "@/lib/notes";
import { toFormState } from "@/lib/forms";
import { validateNoteDraft, type Note, type NoteDraft } from "@/lib/notes-model";
import type { FieldErrors, Role } from "@/lib/types";

export type NotesResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string; fieldErrors?: FieldErrors };

function failure(error: unknown, serverMessage = "Couldn't update your notes. Please try again."): NotesResult<never> {
  if (error instanceof ApiError) {
    const state = toFormState(error);
    const message = error.status >= 500
      ? serverMessage
      : error.status === 404
        ? "That note is no longer available."
        : state.message ?? "Notes request failed.";
    return { ok: false, status: error.status, message, fieldErrors: state.fieldErrors };
  }
  throw error;
}

export async function listNotesAction(role: Role, search = ""): Promise<NotesResult<Note[]>> {
  try { return { ok: true, data: await listNotes(role, search) }; } catch (error) { return failure(error, "Couldn't load your notes. Please try again."); }
}

export async function createNoteAction(role: Role, draft: NoteDraft): Promise<NotesResult<Note>> {
  const errors = validateNoteDraft(draft);
  if (Object.keys(errors).length) return { ok: false, status: 400, message: "Please fix the highlighted fields.", fieldErrors: errors };
  try { return { ok: true, data: await createNote(role, { title: draft.title.trim(), content: draft.content }) }; } catch (error) { return failure(error); }
}

export async function updateNoteAction(role: Role, id: string, draft: NoteDraft, saved: NoteDraft): Promise<NotesResult<Note>> {
  const errors = validateNoteDraft(draft);
  if (Object.keys(errors).length) return { ok: false, status: 400, message: "Please fix the highlighted fields.", fieldErrors: errors };
  const body: NoteDraft = { title: draft.title.trim(), content: draft.content };
  const changed = { ...(body.title !== saved.title ? { title: body.title } : {}), ...(body.content !== saved.content ? { content: body.content } : {}) };
  if (!Object.keys(changed).length) return { ok: true, data: { id, ...body, createdAt: "", updatedAt: "" } };
  try { return { ok: true, data: await updateNote(role, id, changed) }; } catch (error) { return failure(error); }
}

export async function deleteNoteAction(role: Role, id: string): Promise<NotesResult<{ success: true }>> {
  try { return { ok: true, data: await deleteNote(role, id) }; } catch (error) { return failure(error); }
}
