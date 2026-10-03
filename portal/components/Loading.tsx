export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <div className="bar" />
      <span>{label}</span>
      <span className="hint">If the server was idle, the first load can take about 30 seconds.</span>
    </div>
  );
}
