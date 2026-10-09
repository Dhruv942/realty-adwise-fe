import type { FollowUpState } from "./types";

/** Same rules as the backend, so a screen left open stays right: past is overdue, rest of today is today, later is upcoming. */
export function followUpState(at: string, now: Date = new Date()): FollowUpState {
  const when = new Date(at);
  if (when.getTime() <= now.getTime()) return "OVERDUE";
  return when.toDateString() === now.toDateString() ? "TODAY" : "UPCOMING";
}

const time = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
const dayTime = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const full = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Local-zone text for a badge: "Today 4:30 PM" or "12 Oct, 10:30 AM". */
export function followUpLabel(at: string, state: FollowUpState): string {
  const when = new Date(at);
  if (state === "TODAY") return `Today ${time.format(when)}`;
  return dayTime.format(when);
}

export const formatLocal = (iso: string) => full.format(new Date(iso));

/** Value for `<input type="datetime-local">` in the user's local zone. */
export function toLocalInput(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}
