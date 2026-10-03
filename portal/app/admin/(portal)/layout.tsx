import { PortalShell } from "@/components/PortalShell";
import { requireSession } from "@/lib/session";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/executives", label: "Executives" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession("ADMIN");
  return (
    <PortalShell user={user} nav={nav}>
      {children}
    </PortalShell>
  );
}
