"use client";

import { useActionState, useState, useTransition } from "react";
import { Mail, RefreshCcw, Send, ShieldAlert, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { connectZohoAction, disconnectZohoAction, retryZohoNotificationAction, sendZohoTestEmailAction, setZohoNotificationsAction } from "@/lib/actions/zoho";
import type { FormState } from "@/lib/types";
import type { ZohoFailure, ZohoStatus } from "@/lib/zoho";

const idle: FormState = { status: "idle" };

function StatusPill({ status }: { status: ZohoStatus["status"] }) {
  const connected = status === "CONNECTED";
  const reauth = status === "REAUTHORIZATION_REQUIRED";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${connected ? "bg-success-soft text-success" : reauth ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${connected ? "bg-success" : reauth ? "bg-warning" : "bg-subtle"}`} />{connected ? "Connected" : reauth ? "Reauthorization required" : "Not connected"}</span>;
}

function TestEmail() {
  const [state, formAction] = useActionState(sendZohoTestEmailAction, idle);
  const [open, setOpen] = useState(false);
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline"><Send /> Send test email</Button></SheetTrigger><SheetContent side="bottom" title="Send test email"><div className="p-4 sm:p-5"><p className="mb-4 text-sm text-muted-foreground">Send a test assignment email through the connected Zoho account.</p><FormMessage state={state} /><form action={formAction} className="grid gap-4"><div><label htmlFor="zoho-test-recipient" className="text-sm font-medium">Recipient email</label><input id="zoho-test-recipient" name="toAddress" type="email" required placeholder="recipient@example.com" className="field mt-1.5" /></div><div className="flex gap-2"><SubmitButton pendingLabel="Sending…">Send test email</SubmitButton><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div></form></div></SheetContent></Sheet>;
}

function FailureRow({ failure, onRetry, busy }: { failure: ZohoFailure; onRetry: (id: string) => void; busy: boolean }) {
  const id = failure.notificationId ?? failure.id;
  return <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{failure.leadNo ? `Lead #${failure.leadNo}` : "Email notification"}</span><span className="badge badge-danger">Failed</span></div><p className="mt-1 truncate text-sm text-muted-foreground">Recipient: {failure.recipient ?? "Unknown"}</p><p className="mt-1 text-xs text-muted-foreground">Attempts: {failure.attempts ?? "—"}{failure.error ? ` · ${failure.error}` : ""}</p></div>{id && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onRetry(id)}><RefreshCcw /> Retry</Button>}</li>;
}

export function ZohoMailIntegration({ status, loadError, oauthResult }: { status: ZohoStatus | null; loadError?: string; oauthResult?: "connected" | "error" }) {
  const [message, setMessage] = useState(oauthResult === "connected" ? "Zoho Mail connected successfully." : oauthResult === "error" ? "Zoho Mail connection failed. Please try again." : "");
  const [busy, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(status?.notificationEnabled ?? false);
  if (loadError) return <Card className="border-destructive/30 p-5"><div className="flex gap-3"><ShieldAlert className="mt-0.5 size-5 text-destructive" /><div><h2>Zoho Mail</h2><p className="mt-1 text-sm text-muted-foreground">{loadError}</p></div></div></Card>;
  if (!status) return null;
  const connected = status.status === "CONNECTED";
  const reauth = status.status === "REAUTHORIZATION_REQUIRED";
  const disconnect = () => { if (!window.confirm("Are you sure you want to disconnect Zoho Mail?\n\nLead assignment will continue, but email notifications will stop.")) return; startTransition(async () => { const result = await disconnectZohoAction(); setMessage(result.message ?? "Zoho Mail disconnected."); }); };
  const toggle = () => { const next = !enabled; setEnabled(next); startTransition(async () => { const result = await setZohoNotificationsAction(next); setMessage(result.message ?? ""); if (result.status === "error") setEnabled(!next); }); };
  const retry = (id: string) => startTransition(async () => { const result = await retryZohoNotificationAction(id); setMessage(result.message ?? ""); });
  return <Card className="overflow-hidden shadow-sm"><div className="flex flex-col gap-4 border-b border-border bg-muted/20 p-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Mail className="size-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2>Zoho Mail</h2><StatusPill status={status.status} /></div><p className="mt-1 text-sm text-muted-foreground">Send lead assignment emails from your connected Zoho account.</p></div></div>{connected && status.connectedEmail && <div className="rounded-lg border border-border bg-surface px-3 py-2 text-right"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Connected email</p><p className="mt-0.5 text-sm font-medium">{status.connectedEmail}</p></div>}</div><div className="p-5">{message && <p className="mb-4 rounded-lg border border-success/20 bg-success-soft px-3 py-2 text-sm text-success" role="status">{message}</p>}{!connected ? <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-medium">{reauth ? "Reauthorization required" : "Connect your Zoho Mail account"}</h3><p className="mt-1 text-sm text-muted-foreground">{reauth ? "Your Zoho connection has expired. Reconnect to resume email notifications." : "Connect your account to send lead assignment emails."}</p>{status.lastError && <p className="mt-2 text-xs text-destructive">{status.lastError}</p>}</div><form action={connectZohoAction}><Button type="submit"><Mail />{reauth ? "Reconnect Zoho Mail" : "Connect Zoho Mail"}</Button></form></div> : <><div className="flex flex-wrap items-center gap-2"><TestEmail /><Button type="button" variant="outline" disabled={busy} onClick={disconnect}><Unplug /> Disconnect</Button></div><div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4"><div><p className="text-sm font-medium">Enable assignment emails</p><p className="mt-1 text-xs text-muted-foreground">Send an email when a lead is assigned to an executive.</p></div><button type="button" role="switch" aria-checked={enabled} disabled={busy} onClick={toggle} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-border-strong"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} /></button></div></>}{connected && status.recentFailures.length > 0 && <section className="mt-6 border-t border-border pt-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="font-medium">Recent email failures</h3><p className="mt-1 text-xs text-muted-foreground">Retry a failed assignment notification.</p></div><span className="rounded-full bg-destructive-soft px-2.5 py-1 text-xs font-medium text-destructive">{status.recentFailures.length} failed</span></div><ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">{status.recentFailures.map((failure, index) => <FailureRow key={failure.notificationId ?? failure.id ?? index} failure={failure} onRetry={retry} busy={busy} />)}</ul></section>}</div></Card>;
}
