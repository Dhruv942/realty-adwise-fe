const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

export function formatBudget(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} Lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function whatsappUrl(mobile: string): string {
  return `https://wa.me/${mobile.replace(/\D/g, "")}`;
}

/** Fallback only. The backend sends each lead's real SLA (`lead.sla`). */
export const SLA_MINUTES = 90;

const clock = new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" });

/** "Update status by 3:45 pm" while a lead is still INCOMING. */
export function slaDeadline(status: string, assignedAt: string | null, minutes: number = SLA_MINUTES): string | null {
  if (status !== "INCOMING" || !assignedAt) return null;
  const t = new Date(assignedAt).getTime() + minutes * 60_000;
  return Number.isNaN(t) ? null : clock.format(new Date(t));
}
