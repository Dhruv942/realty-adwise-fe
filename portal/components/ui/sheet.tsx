"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  side = "left",
  title,
  className,
  children,
}: {
  side?: "left" | "bottom";
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40" />
      <Dialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed z-50 flex flex-col bg-card shadow-xl outline-none",
          side === "left" && "inset-y-0 left-0 w-[85%] max-w-xs",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <Dialog.Title className="font-display text-base font-light uppercase tracking-[.14em]">{title}</Dialog.Title>
          <Dialog.Close className="grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Close">
            <X className="size-5" />
          </Dialog.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
