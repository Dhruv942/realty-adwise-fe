"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useTransition } from "react";

const AREAS = { admin: "Admin overview", manager: "Manager overview", executive: "My leads" } as const;

/**
 * Error boundary UI. Server errors reach the browser without their message in production, so this
 * explains the likely cause in plain words and offers a way out instead of showing raw details.
 */
export function ErrorView({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const pathname = usePathname();
  const [retrying, startRetry] = useTransition();
  const area = pathname.split("/")[1] as keyof typeof AREAS;
  const home = area in AREAS ? { href: `/${area}`, label: `Go to ${AREAS[area]}` } : { href: "/", label: "Go to sign in" };

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" aria-labelledby="error-title" className="grid max-w-xl justify-items-start gap-3 py-8 sm:py-12">
      <p className="flex items-center gap-2 text-[13px] font-medium text-destructive">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-destructive" />
        Couldn&apos;t load this page
      </p>
      <h1 id="error-title">The server didn&apos;t return this data</h1>
      <p className="muted">
        It may be busy, restarting, or briefly unreachable. Nothing was changed. Try again in a moment; if it keeps happening, send the reference below to whoever runs the
        portal.
      </p>
      {process.env.NODE_ENV === "development" && error.message && <pre className="w-full overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">{error.message}</pre>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn btn-solid" aria-busy={retrying} disabled={retrying} onClick={() => startRetry(() => retry())}>
          {retrying ? "Trying again…" : "Try again"}
        </button>
        <Link className="btn btn-line" href={home.href}>
          {home.label}
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Reference: <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </section>
  );
}
