import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="panel">
      <h2>Not found</h2>
      <p className="muted">This record doesn&apos;t exist or has been removed.</p>
      <div>
        <Link className="btn btn-line" href="/admin">
          Back to overview
        </Link>
      </div>
    </div>
  );
}
