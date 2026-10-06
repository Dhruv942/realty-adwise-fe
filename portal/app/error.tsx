"use client";

import { ErrorView } from "@/components/ErrorView";

export default function RootError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-6xl content-center px-4 sm:px-6">
      <ErrorView {...props} />
    </main>
  );
}
