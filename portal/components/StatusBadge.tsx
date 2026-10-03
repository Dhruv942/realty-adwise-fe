export function StatusBadge({ active }: { active: boolean }) {
  return <span className={`badge ${active ? "badge-on" : "badge-off"}`}>{active ? "Active" : "Inactive"}</span>;
}
