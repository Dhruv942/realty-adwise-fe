"use client";

import { WhatsAppActionButtons } from "@/components/realtime/WhatsAppActionButtons";
import { useRealtime } from "@/components/realtime/RealtimeProvider";

export function LeadWhatsAppActions({ message }: { message: string }) {
  const { notify } = useRealtime();
  return (
    <section className="panel grid gap-3 whatsapp-panel" aria-labelledby="customer-history-whatsapp">
      <div>
        <h2 id="customer-history-whatsapp">Customer history for WhatsApp</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use the complete CRM message below. It is provided by the backend notification.</p>
      </div>
      <pre className="notification-message rounded-lg border border-border bg-muted/30 p-3">{message}</pre>
      <WhatsAppActionButtons message={message} notify={notify} />
    </section>
  );
}
