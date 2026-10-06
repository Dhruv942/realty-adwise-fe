import { AppShell } from "@/components/shell/AppShell";
import type { SessionUser } from "@/lib/types";

export function PortalShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return <AppShell user={user}>{children}</AppShell>;
}
