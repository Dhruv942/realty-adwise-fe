import { cn } from "@/lib/utils";

/*
 * Route loading states. Each one mirrors the layout of the page it stands in for, so content
 * doesn't jump when it arrives.
 */

function Bar({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("skeleton block h-3.5", className)} />;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-5 sm:gap-6">
      <span className="sr-only">Loading…</span>
      {children}
      {process.env.NEXT_PUBLIC_SHOW_WAKEUP_HINT && <p className="hint">If the server was idle, the first load can take about 30 seconds.</p>}
    </div>
  );
}

function Head({ action = false, back = false }: { action?: boolean; back?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="grid gap-2.5">
        {back && <Bar className="h-3 w-20" />}
        <Bar className="h-6 w-48" />
        <Bar className="h-3 w-64 max-w-[60vw]" />
      </div>
      {action && <Bar className="hidden h-10 w-32 rounded-lg sm:block" />}
    </div>
  );
}

function Filters({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-end gap-2.5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn("grid flex-1 basis-36 gap-2", i === 0 && "basis-full sm:basis-60")}>
          <Bar className="h-3 w-14" />
          <Bar className="h-10 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function TableRows({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex gap-6 border-b border-border px-4 py-3">
        {Array.from({ length: cols }, (_, i) => (
          <Bar key={i} className={cn("h-3 w-16", i > 1 && "hidden sm:block")} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-6 border-b border-border px-4 py-3.5 last:border-0">
          <div className="grid flex-[2] gap-2">
            <Bar className={cn("w-40 max-w-full", r % 3 === 1 && "w-32")} />
            <Bar className="h-3 w-24" />
          </div>
          {Array.from({ length: cols - 1 }, (_, i) => (
            <Bar key={i} className={cn("flex-1", i > 0 && "hidden sm:block")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <Frame>
      <Head action />
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="grid gap-2.5 border-border p-4 odd:border-r [&:nth-child(-n+2)]:border-b lg:border-r lg:last:border-r-0 lg:[&:nth-child(-n+2)]:border-b-0 sm:px-5">
            <Bar className="h-3 w-20" />
            <Bar className="h-7 w-12" />
            <Bar className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        <Bar className="h-4 w-28" />
        <TableRows rows={6} cols={4} />
      </div>
    </Frame>
  );
}

export function TableSkeleton({ filters = 3, cols = 4, action = true }: { filters?: number; cols?: number; action?: boolean }) {
  return (
    <Frame>
      <Head action={action} />
      {filters > 0 && <Filters count={filters} />}
      <TableRows cols={cols} />
    </Frame>
  );
}

export function LeadListSkeleton() {
  return (
    <Frame>
      <Head action />
      <Filters count={4} />
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_9.5rem_auto]">
            <div className="col-span-2 grid gap-2 md:col-span-1">
              <Bar className={cn("w-44", i % 2 && "w-36")} />
              <Bar className="h-3 w-64 max-w-full" />
              <Bar className="h-3 w-40" />
            </div>
            <Bar className="w-20" />
            <div className="flex gap-1.5">
              <Bar className="h-9 w-16 rounded-lg" />
              <Bar className="h-9 w-24 rounded-lg" />
              <Bar className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function DetailSkeleton() {
  const Section = ({ rows }: { rows: number }) => (
    <div className="grid gap-4 border-border p-5 [&:not(:first-child)]:border-t">
      <Bar className="h-4 w-28" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-6">
          <Bar className="h-3 w-20" />
          <Bar className={cn("h-3 flex-1", i % 2 && "max-w-40")} />
        </div>
      ))}
    </div>
  );
  return (
    <Frame>
      <Head back />
      <div className="grid items-start gap-5 min-[901px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <Section rows={7} />
          <Section rows={3} />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <Section rows={2} />
          <Section rows={2} />
        </div>
      </div>
    </Frame>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <Frame>
      <Head back />
      <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="grid gap-2">
            <Bar className="h-3 w-24" />
            <Bar className="h-10 rounded-lg" />
          </div>
        ))}
        <Bar className="h-10 w-32 rounded-lg" />
      </div>
    </Frame>
  );
}
