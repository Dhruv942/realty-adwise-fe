"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { clearFollowUpAction, getFollowUpAction, setFollowUpAction } from "@/lib/actions/leads";
import { formatLocal, toLocalInput } from "@/lib/follow-up";
import type { LeadFollowUp, Role } from "@/lib/types";
import { FollowUpBadge } from "./FollowUpBadge";

const NOTE_MAX = 500;

/** Follow-up section of lead detail: shows the current follow-up and edits it in a bottom sheet (phones) or dialog. */
export function FollowUpPanel({ role, leadId, initial }: { role: Role; leadId: string; initial: LeadFollowUp | null }) {
  const router = useRouter();
  const [followUp, setFollowUp] = useState(initial);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // The server re-renders the page after a save or refresh; keep in step with it.
  useEffect(() => setFollowUp(initial), [initial]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <section className="panel">
      <h2>Follow-up</h2>
      {followUp ? (
        <div className="stack">
          <p className="flex flex-wrap items-center gap-2">
            <FollowUpBadge followUp={followUp} />
            <span>{formatLocal(followUp.at)}</span>
          </p>
          {followUp.note && <p className="whitespace-pre-wrap">{followUp.note}</p>}
          <p className="muted text-sm">
            Updated by {followUp.updatedBy?.name ?? "a removed user"} on {formatLocal(followUp.updatedAt)}
          </p>
        </div>
      ) : (
        <p className="muted">No follow-up scheduled</p>
      )}
      <div className="mt-3">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="btn btn-line">
              {followUp ? "Edit follow-up" : "Schedule follow-up"}
            </button>
          </Dialog.Trigger>
          <EditDialog
            role={role}
            leadId={leadId}
            current={followUp}
            onSaved={(next, message) => {
              setFollowUp(next);
              setOpen(false);
              setToast(message);
              router.refresh();
            }}
          />
        </Dialog.Root>
      </div>
      {toast && (
        <p className="notice notice-success mt-3" role="status">
          {toast}
        </p>
      )}
    </section>
  );
}

function EditDialog({ role, leadId, current, onSaved }: { role: Role; leadId: string; current: LeadFollowUp | null; onSaved: (next: LeadFollowUp | null, message: string) => void }) {
  const [latest, setLatest] = useState(current);
  const [loading, setLoading] = useState(true);
  const [at, setAt] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, startTransition] = useTransition();
  const [min] = useState(() => toLocalInput(new Date()));
  const unchanged = Boolean(latest && at === toLocalInput(new Date(latest.at)));

  // Someone else may have changed it, so load the lead afresh each time the dialog opens.
  useEffect(() => {
    let alive = true;
    getFollowUpAction(role, leadId).then((result) => {
      if (!alive) return;
      const fresh = result.ok ? result.followUp : current;
      setLatest(fresh);
      setAt(fresh ? toLocalInput(new Date(fresh.at)) : "");
      setNote(fresh?.note ?? "");
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, leadId]);

  function finish(result: Awaited<ReturnType<typeof setFollowUpAction>>, done: string) {
    if (result.ok) return onSaved(result.followUp, done);
    setErrors(result.fieldErrors ?? {});
    setMessage(result.fieldErrors ? null : result.message);
    setConfirmClear(false);
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setMessage(null);
    if (!at) return setErrors({ followUpAt: "Choose a date and time" });
    // datetime-local is local time, so send an instant with an offset. An untouched time is sent
    // back exactly as stored (the input drops seconds), which the API allows even when overdue.
    const iso = unchanged && latest ? latest.at : new Date(at).toISOString();
    startTransition(async () => finish(await setFollowUpAction(role, leadId, iso, note.trim() || null), "Follow-up saved"));
  }

  function clear() {
    setErrors({});
    setMessage(null);
    startTransition(async () => finish(await clearFollowUpAction(role, leadId), "Follow-up cleared"));
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="overlay fixed inset-0 z-50 bg-overlay" />
      <Dialog.Content
        aria-describedby={undefined}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-xl border-t border-border bg-surface-elevated pb-[env(safe-area-inset-bottom)] shadow-lg outline-none sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:mx-auto sm:max-w-md sm:-translate-y-1/2 sm:rounded-xl sm:border"
      >
        <div className="flex h-14 items-center justify-between border-b border-border pl-4 pr-2">
          <Dialog.Title className="font-display text-[15px] font-semibold">{latest ? "Edit follow-up" : "Schedule follow-up"}</Dialog.Title>
          <Dialog.Close className="grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close">
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
        </div>
        <form onSubmit={save} className="stack p-4">
          {message && (
            <p className="notice notice-error" role="alert">
              {message}
            </p>
          )}
          <div className={`field${errors.followUpAt ? " has-error" : ""}`}>
            <label htmlFor="fu-at">Date and time</label>
            <input id="fu-at" type="datetime-local" value={at} min={unchanged ? undefined : min} onChange={(e) => setAt(e.target.value)} disabled={loading} required />
            {errors.followUpAt && <p className="field-error">{errors.followUpAt}</p>}
          </div>
          <div className={`field${errors.followUpNote ? " has-error" : ""}`}>
            <label htmlFor="fu-note">Note (optional)</label>
            <textarea id="fu-note" value={note} maxLength={NOTE_MAX} onChange={(e) => setNote(e.target.value)} disabled={loading} placeholder="e.g. Call about the loan" />
            <p className="field-hint text-right" aria-live="polite">
              {note.length}/{NOTE_MAX}
            </p>
            {errors.followUpNote && <p className="field-error">{errors.followUpNote}</p>}
          </div>
          {confirmClear ? (
            <div className="notice notice-warn" role="alertdialog" aria-label="Confirm clearing the follow-up">
              <p>Clear this follow-up and its note?</p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn btn-danger-solid" onClick={clear} disabled={pending}>
                  Yes, clear it
                </button>
                <button type="button" className="btn btn-line" onClick={() => setConfirmClear(false)} disabled={pending}>
                  Keep it
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              {latest && (
                <button type="button" className="btn btn-line sm:mr-auto" onClick={() => setConfirmClear(true)} disabled={pending || loading}>
                  Clear follow-up
                </button>
              )}
              <Dialog.Close asChild>
                <button type="button" className="btn btn-line">
                  Cancel
                </button>
              </Dialog.Close>
              <button type="submit" className="btn btn-solid" disabled={pending || loading} aria-busy={pending}>
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" /> Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          )}
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
