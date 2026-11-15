import { Building2, ContactRound, LayoutDashboard, ListChecks, Settings, UserCog, ArrowLeftRight, UserRound, UsersRound, Users, type LucideIcon } from "lucide-react";
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
    { href: "/admin/view", label: "Switch dashboard", icon: ArrowLeftRight },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  MANAGER: [
    { href: "/manager", label: "Overview", icon: LayoutDashboard, primary: true, exact: true },
    { href: "/manager/leads", label: "Leads", icon: ListChecks, primary: true },
    { href: "/manager/executives", label: "My executives", icon: UsersRound, primary: true },
    { href: "/manager/view", label: "Switch to Executive", icon: ArrowLeftRight },
  ],
  EXECUTIVE: [
    { href: "/executive", label: "My leads", icon: ListChecks, primary: true },
  ],
};

export const SEARCH_ACTION: Record<Role, string> = { ADMIN: "/admin/leads", MANAGER: "/manager/leads", EXECUTIVE: "/executive" };
export const PROFILE_ICON = Users;
