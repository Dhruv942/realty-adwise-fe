"use client";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Copy, Share2 } from "lucide-react";
import { copyForWhatsApp, shareOnWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsAppActionButtons({ message, notify, compact = false, className }: { message: string; notify: (message: string, tone?: "info" | "warn") => void; compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        className={cn("btn btn-line whatsapp-action whatsapp-action-copy", compact && "btn-sm")}
        onClick={() => void copyForWhatsApp(message, { success: (text) => notify(text), error: (text) => notify(text, "warn") })}
      >
        <Copy aria-hidden="true" />
        Copy message
      </button>
      <button
        type="button"
        className={cn("btn btn-solid whatsapp-action whatsapp-action-share", compact && "btn-sm")}
        onClick={() => shareOnWhatsApp(message)}
      >
        <WhatsAppIcon aria-hidden="true" />
        Share on WhatsApp
        <Share2 className="whatsapp-action-share-icon" aria-hidden="true" />
      </button>
    </div>
  );
}
