export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteDraft = Pick<Note, "title" | "content">;

export function isNoteDirty(saved: NoteDraft | null, draft: NoteDraft): boolean {
  return saved !== null && (saved.title !== draft.title || saved.content !== draft.content);
}

export function validateNoteDraft(draft: NoteDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = draft.title.trim();
  if (!title) errors.title = "Title is required";
  else if (title.length > 200) errors.title = "Title must be at most 200 characters";
  if (draft.content.length > 20_000) errors.content = "Content must be at most 20,000 characters";
  return errors;
}

export function sortNotes<T extends Note>(notes: T[]): T[] {
  return [...notes].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
