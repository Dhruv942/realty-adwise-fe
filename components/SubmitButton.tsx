"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "solid" | "line" | "danger";
  size?: "sm";
  /** Ask before submitting, e.g. "Delete Asha? She will be hidden from lists." The first sentence becomes the dialog title. */
  confirm?: string;
};

/** Submit button that shows progress, and explains the wait when the backend is cold-starting. */
export function SubmitButton({ children, pendingLabel = "Working…", variant = "solid", size, confirm }: Props) {
  const { pending } = useFormStatus();
  const slow = useSlow(pending);
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const button = (
    <button
      ref={ref}
      type={confirm ? "button" : "submit"}
      className={`btn btn-${variant}${size ? ` btn-${size}` : ""}`}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );

  return (
    <span className="submit">
      {confirm ? (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>{button}</Dialog.Trigger>
          <ConfirmDialog
            message={confirm}
            actionLabel={typeof children === "string" ? children : "Confirm"}
            destructive={variant === "danger"}
            onConfirm={() => {
              setOpen(false);
              // The dialog is portalled outside the form, so submit the form the trigger belongs to.
              ref.current?.form?.requestSubmit();
            }}
          />
        </Dialog.Root>
      ) : (
        button
      )}
      {slow && process.env.NEXT_PUBLIC_SHOW_WAKEUP_HINT && (
        <span className="hint" role="status">
          The server is waking up. This can take about 30 seconds.
        </span>
      )}
    </span>
  );
}

function ConfirmDialog({ message, actionLabel, destructive, onConfirm }: { message: string; actionLabel: string; destructive: boolean; onConfirm: () => void }) {
  const split = message.search(/[?.]\s/);
  const title = split === -1 ? message : message.slice(0, split + 1);
  const detail = split === -1 ? "" : message.slice(split + 2).trim();
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="overlay fixed inset-0 z-50 bg-overlay" />
      <Dialog.Content
        role="alertdialog"
        className="dialog fixed inset-x-4 top-1/2 z-50 mx-auto h-fit max-w-sm -translate-y-1/2 rounded-xl border border-border bg-surface-elevated p-5 shadow-lg outline-none"
        onOpenAutoFocus={(event) => {
          // Start on Cancel so Enter never confirms a destructive action by accident.
          event.preventDefault();
          (event.currentTarget as HTMLElement).querySelector<HTMLButtonElement>("[data-cancel]")?.focus();
        }}
      >
        <Dialog.Title className="font-display text-base font-semibold">{title}</Dialog.Title>
        {detail ? <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">{detail}</Dialog.Description> : <Dialog.Description className="sr-only">Confirm or cancel this action.</Dialog.Description>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Dialog.Close asChild>
            <button type="button" data-cancel className="btn btn-line">
              Cancel
            </button>
          </Dialog.Close>
          <button type="button" className={`btn ${destructive ? "btn-danger-solid" : "btn-solid"}`} onClick={onConfirm}>
            {actionLabel}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function useSlow(pending: boolean, afterMs = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!pending) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), afterMs);
    return () => clearTimeout(timer);
  }, [pending, afterMs]);
  return slow;
}
