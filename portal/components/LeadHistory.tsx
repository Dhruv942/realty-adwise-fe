import type { HistoryEntry } from "@/lib/types";
import { formatBudget, formatDate } from "@/lib/format";
import { EnquiryBadge } from "./EnquiryBadge";
import { LeadStatusBadge } from "./LeadStatusBadge";

export function LeadHistory({ history, count }: { history: HistoryEntry[]; count: number }) {
  if (history.length === 0) {
    return <p className="muted">First enquiry from this client.</p>;
  }
  return (
    <>
      <p className="muted">Previous enquiries ({Math.max(count - 1, history.length)})</p>
      <ul className="history">
        {history.map((h) => (
          <li key={h.id}>
            <div className="history-head">
              <strong>
                {h.property.name}
                {h.enquiryType && <EnquiryBadge type={h.enquiryType} className="ml-2" />}
              </strong>
              <LeadStatusBadge status={h.status} />
            </div>
            <div className="muted person-sub">
              {formatDate(h.createdAt)} · #{h.leadNo}
              {h.assignedExecutive ? ` · ${h.assignedExecutive.name}` : ""}
            </div>
            <div className="history-meta">
              {[h.requirement, h.budget != null ? formatBudget(h.budget) : null, h.source].filter(Boolean).join(" · ")}
            </div>
            {h.message && <p className="history-msg">{h.message}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
