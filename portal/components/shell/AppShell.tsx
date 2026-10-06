"use client";

import { LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV, SEARCH_ACTION, type NavItem } from "./nav";

const ROLE_LABEL = { ADMIN: "Admin", MANAGER: "Manager", EXECUTIVE: "Executive" } as const;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

function isActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

function NavList({ items, pathname, collapsed, onNavigate }: { items: NavItem[]; pathname: string; collapsed?: boolean; onNavigate?: boolean }) {
  return (
    <ul className="grid gap-1">
      {items.map((item) => {
        const active = isActive(item, pathname);
        const link = (
          <Link
            href={item.href}
            title={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-3 rounded-lg px-3 font-display text-xs uppercase tracking-[.2em] transition-colors",
              collapsed && "justify-center px-0 lg:justify-start lg:px-3",
              active ? "bg-muted text-foreground" : "text-[#4a4a4a] hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-5 shrink-0" />
            <span className={cn(collapsed && "hidden lg:inline")}>{item.label}</span>
          </Link>
        );
        return <li key={item.href}>{onNavigate ? <SheetClose asChild>{link}</SheetClose> : link}</li>;
      })}
    </ul>
  );
}

function UserBlock({ user, collapsed }: { user: SessionUser; collapsed?: boolean }) {
  return (
    <div className="grid gap-3">
      <div className={cn("flex items-center gap-3", collapsed && "justify-center lg:justify-start")}>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground font-display text-xs tracking-wider text-white">{initials(user.name)}</span>
        <div className={cn("min-w-0", collapsed && "hidden lg:block")}>
          <p className="truncate text-sm">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          title="Log out"
          className={cn(
            "flex h-11 w-full items-center gap-3 rounded-lg px-3 font-display text-xs uppercase tracking-[.2em] text-[#4a4a4a] hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0 lg:justify-start lg:px-3",
          )}
        >
          <LogOut className="size-5 shrink-0" />
          <span className={cn(collapsed && "hidden lg:inline")}>Log out</span>
        </button>
      </form>
    </div>
  );
}

function Brand({ role }: { role: SessionUser["role"] }) {
  return (
    <Link href={NAV[role][0].href} className="flex items-center gap-2.5">
      <span className="flex items-baseline gap-2.5">
        <span className="font-display text-lg font-light uppercase tracking-[.14em]">Realty Adwise</span>
        <span className="font-display text-[10px] uppercase tracking-[.3em] text-muted-foreground">{ROLE_LABEL[role]}</span>
      </span>
    </Link>
  );
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const items = NAV[user.role];
  const primary = items.filter((i) => i.primary);
  const current = [...items].reverse().find((i) => isActive(i, pathname));

  return (
    <div className="min-h-dvh">
      {/* Tablet: icon rail. Laptop and up: full sidebar. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col justify-between border-r border-border bg-card p-3 sm:flex lg:w-64 lg:p-4">
        <div className="grid gap-6">
          <div className="flex justify-center lg:justify-start">
            <span className="lg:hidden">
              <Link href={items[0].href} className="grid size-10 place-items-center rounded-lg bg-foreground font-display text-sm tracking-wider text-white" aria-label="Home">
                RA
              </Link>
            </span>
            <span className="hidden lg:block">
              <Brand role={user.role} />
            </span>
          </div>
          <nav aria-label="Main">
            <NavList items={items} pathname={pathname} collapsed />
          </nav>
        </div>
        <UserBlock user={user} collapsed />
      </aside>

      <div className="sm:pl-[72px] lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur sm:h-16 sm:gap-4 sm:px-6">
          <Sheet>
            <SheetTrigger className="grid size-11 place-items-center rounded-lg text-foreground hover:bg-muted sm:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent title="Menu">
              <div className="grid gap-6 p-3">
                <Brand role={user.role} />
                <nav aria-label="Menu">
                  <NavList items={items} pathname={pathname} onNavigate />
                </nav>
                <div className="border-t border-border pt-4">
                  <UserBlock user={user} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="min-w-0 flex-1 truncate font-display text-base font-light uppercase tracking-[.14em] sm:hidden">{current?.label ?? "Realty Adwise"}</h1>

          <form action={SEARCH_ACTION[user.role]} method="get" role="search" className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="search"
              type="search"
              placeholder="Search leads by client, mobile or property"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground"
            />
          </form>

          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <span className="text-right leading-tight">
              <span className="block text-sm">{user.name}</span>
              <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-foreground font-display text-xs tracking-wider text-white">{initials(user.name)}</span>
          </div>
          <Link href={SEARCH_ACTION[user.role]} className="grid size-11 place-items-center rounded-lg text-foreground hover:bg-muted sm:hidden" aria-label="Search leads">
            <Search className="size-5" />
          </Link>
        </header>

        <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 pb-28 sm:gap-6 sm:px-6 sm:py-8 sm:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {primary.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-16 flex-col items-center justify-center gap-1 font-display text-[10px] uppercase tracking-[.14em]", active ? "text-foreground" : "text-muted-foreground")}
                >
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full", active && "bg-muted")}>
                    <item.icon className="size-5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
