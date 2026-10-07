import { ENQUIRY_LABEL, type EnquiryType } from "@/lib/types";
import { cn } from "@/lib/utils";

/** "Rent" or "Buy" pill. Render only when the lead has one. */
export function EnquiryBadge({ type, className }: { type: EnquiryType; className?: string }) {
  return (
    <span className={cn("inline-flex items-center self-center rounded-md border border-border bg-muted px-1.5 py-px align-middle text-[11px] font-semibold text-foreground", className)}>
      {ENQUIRY_LABEL[type]}
    </span>
  );
}
