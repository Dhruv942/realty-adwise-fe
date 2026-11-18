import { PortalShell } from "@/components/PortalShell";
import { requireSession } from "@/lib/session";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession("ADMIN");
  return (
    <PortalShell user={user}>
      {children}
    </PortalShell>
  );
}
