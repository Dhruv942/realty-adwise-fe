import { statusLabel } from "@/lib/format";

const TONE: Record<string, string> = {
  PENDING_ASSIGNMENT: "badge-warn",
  INCOMING: "badge-info",
  RINGING: "badge-warn",
  CONNECTED: "badge-on",
  CLOSED: "badge-on",
  LOST: "badge-off",
  BROKER: "badge-info",
};

export function LeadStatusBadge({ status }: { status: string }) {
  return <span className={`badge ${TONE[status] ?? "badge-off"}`}>{statusLabel(status)}</span>;
}
