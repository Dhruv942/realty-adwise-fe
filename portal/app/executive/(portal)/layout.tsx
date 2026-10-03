import { PortalShell } from "@/components/PortalShell";
import { requireSession } from "@/lib/session";

const nav = [{ href: "/executive", label: "Home" }];

export default async function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession("EXECUTIVE");
  return (
    <PortalShell user={user} nav={nav}>
      {children}
    </PortalShell>
  );
}
