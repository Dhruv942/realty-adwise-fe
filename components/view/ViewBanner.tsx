import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";

/** Always shown on a "view as" page: whose dashboard this is, that it is read-only, and the way back. */
export function ViewBanner({ name, roleLabel, backHref, backLabel }: { name: string; roleLabel: string; backHref: string; backLabel: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm" role="status">
      <p className="flex min-w-0 items-center gap-2">
        <Eye className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0">
          Viewing <strong className="font-semibold">{name}</strong>&apos;s {roleLabel} dashboard
          <span className="text-muted-foreground"> · read-only, you are still signed in as yourself</span>
        </span>
      </p>
      <Link href={backHref} className="inline-flex min-h-9 items-center gap-1.5 rounded-md font-medium underline-offset-4 hover:underline">
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {backLabel}
      </Link>
    </div>
  );
}
