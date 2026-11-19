import type { ReactNode } from "react";

/** Renders the small Markdown subset used by backend notification messages. */
export function NotificationMessage({ message, className }: { message: string; className?: string }) {
  const parts = message.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, index): ReactNode => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
