import "server-only";
import { cache } from "react";
import { authedRequest } from "./api";
import type { Role } from "./types";
import type { Note } from "./notes-model";

const enc = encodeURIComponent;

export const listNotes = (role: Role, search = "", limit = "50", offset = "0") =>
  authedRequest<Note[]>(role, "/notes", { query: { search: search || undefined, limit, offset } });

export const getNote = cache((role: Role, id: string) => authedRequest<Note>(role, `/notes/${enc(id)}`));

export const createNote = (role: Role, body: { title: string; content?: string }) =>
  authedRequest<Note>(role, "/notes", { method: "POST", body });

export const updateNote = (role: Role, id: string, body: { title?: string; content?: string }) =>
  authedRequest<Note>(role, `/notes/${enc(id)}`, { method: "PATCH", body });

export const deleteNote = (role: Role, id: string) =>
  authedRequest<{ success: true }>(role, `/notes/${enc(id)}`, { method: "DELETE" });
