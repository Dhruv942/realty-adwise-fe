"use client";

import { useEffect } from "react";

export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="panel" role="alert">
      <h2>Something went wrong</h2>
      <p className="muted">
        We couldn&apos;t load this page. The server may still be waking up, or it returned an error.
        {error.digest && <> Reference: {error.digest}</>}
      </p>
      <div>
        <button type="button" className="btn btn-solid" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
