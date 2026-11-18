import { PortalShell } from "@/components/PortalShell";
import { requireSession } from "@/lib/session";


export default async function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession("EXECUTIVE");
  return (
    <PortalShell user={user}>
      {children}
    </PortalShell>
  );
}
