import { PortalShell } from "@/components/PortalShell";
import { requireSession } from "@/lib/session";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/executives", label: "Executives" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/customers", label: "Clients" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession("ADMIN");
  return (
    <PortalShell user={user} nav={nav}>
      {children}
    </PortalShell>
  );
}
