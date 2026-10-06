import { Building2, ContactRound, LayoutDashboard, ListChecks, UserCog, UserRound, UsersRound, Users, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/types";

export type NavItem = { href: string; label: string; icon: LucideIcon; /** Shown in the mobile bottom bar. */ primary?: boolean; exact?: boolean };

// Only screens that exist today. Notifications, follow-ups, Important, managers and reports
// are added here once their APIs are wired up.
export const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, primary: true, exact: true },
    { href: "/admin/leads", label: "Leads", icon: ListChecks, primary: true },
    { href: "/admin/properties", label: "Properties", icon: Building2, primary: true },
    { href: "/admin/customers", label: "Clients", icon: ContactRound, primary: true },
    { href: "/admin/managers", label: "Managers", icon: UserCog },
    { href: "/admin/executives", label: "Executives", icon: UserRound },
    { href: "/admin/teams", label: "Teams", icon: UsersRound },
  ],
  MANAGER: [
    { href: "/manager", label: "Overview", icon: LayoutDashboard, primary: true, exact: true },
    { href: "/manager/leads", label: "Leads", icon: ListChecks, primary: true },
    { href: "/manager/team", label: "Team", icon: UsersRound, primary: true },
  ],
  EXECUTIVE: [
    { href: "/executive", label: "My leads", icon: ListChecks, primary: true },
  ],
};

export const SEARCH_ACTION: Record<Role, string> = { ADMIN: "/admin/leads", MANAGER: "/manager/leads", EXECUTIVE: "/executive" };
export const PROFILE_ICON = Users;
