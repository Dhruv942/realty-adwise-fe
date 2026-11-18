import { PortalShell } from "@/components/PortalShell";
import { requireSession } from "@/lib/session";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession("MANAGER");
  return <PortalShell user={user}>{children}</PortalShell>;
}
