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
      <Dialog.Overlay className="overlay fixed inset-0 z-50 bg-overlay" />
      <Dialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed z-50 flex flex-col border-border bg-surface shadow-lg outline-none",
          side === "left" && "sheet-left inset-y-0 left-0 w-[85%] max-w-xs border-r",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border pl-4 pr-2">
          <Dialog.Title className="font-display text-[15px] font-semibold">{title}</Dialog.Title>
          <Dialog.Close className="grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close menu">
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
