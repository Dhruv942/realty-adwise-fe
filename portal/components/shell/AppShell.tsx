"use client";

import { LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NAV, SEARCH_ACTION, type NavItem } from "./nav";

const ROLE_LABEL = { ADMIN: "Admin", MANAGER: "Manager", EXECUTIVE: "Executive" } as const;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

function isActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

/** `rail` = tablet icon rail that widens into a full sidebar on laptops. */
function NavList({ items, pathname, rail, onNavigate }: { items: NavItem[]; pathname: string; rail?: boolean; onNavigate?: boolean }) {
  return (
    <ul className="grid gap-0.5">
      {items.map((item) => {
        const active = isActive(item, pathname);
        const link = (
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            data-tip={rail ? item.label : undefined}
            className={cn(
              "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors lg:h-9",
              rail && "tip tip-right rail-tip justify-center px-0 lg:justify-start lg:px-3",
              active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent-ink" />}
            <item.icon className="size-[18px] shrink-0" strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
            <span className={cn(rail && "sr-only lg:not-sr-only")}>{item.label}</span>
          </Link>
        );
        return <li key={item.href}>{onNavigate ? <SheetClose asChild>{link}</SheetClose> : link}</li>;
      })}
    </ul>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-muted font-display text-xs font-semibold text-foreground">
      {initials(name)}
    </span>
  );
}

function LogoutButton({ rail }: { rail?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        data-tip={rail ? "Log out" : undefined}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:h-9",
          rail && "tip tip-right rail-tip justify-center px-0 lg:justify-start lg:px-3",
        )}
      >
        <LogOut className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className={cn(rail && "sr-only lg:not-sr-only")}>Log out</span>
      </button>
    </form>
  );
}

function Mark() {
  return (
    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary font-display text-xs font-bold text-primary-foreground">
      RA
    </span>
  );
}

function Brand({ role }: { role: SessionUser["role"] }) {
  return (
    <Link href={NAV[role][0].href} className="flex items-center gap-2.5 rounded-lg">
      <Mark />
      <span className="grid leading-tight">
        <span className="font-display text-[15px] font-semibold">Realty Adwise</span>
        <span className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
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
      <a href="#main" className="sr-only z-50 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>

      {/* Tablet: icon rail. Laptop and up: full sidebar. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-16 flex-col border-r border-border bg-surface sm:flex lg:w-60">
        <div className="flex h-14 shrink-0 items-center justify-center border-b border-border px-3 lg:justify-start lg:px-4">
          <span className="lg:hidden">
            <Link href={items[0].href} aria-label="Realty Adwise home" className="block rounded-lg">
              <Mark />
            </Link>
          </span>
          <span className="hidden lg:block">
            <Brand role={user.role} />
          </span>
        </div>
        <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto p-3">
          <NavList items={items} pathname={pathname} rail />
        </nav>
        <div className="grid gap-1 border-t border-border p-3">
          <div className="mb-1 flex items-center justify-center gap-2.5 lg:justify-start lg:px-1">
            <Avatar name={user.name} />
            <span className="sr-only lg:not-sr-only lg:min-w-0 lg:flex-1">
              <span className="block truncate text-sm font-medium">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
          </div>
          <LogoutButton rail />
        </div>
      </aside>

      <div className="sm:pl-16 lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background px-2 sm:gap-3 sm:px-6">
          <Sheet>
            <SheetTrigger className="grid size-11 place-items-center rounded-lg text-foreground hover:bg-muted sm:hidden" aria-label="Open menu">
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent title="Menu">
              <div className="grid gap-5 p-3">
                <div className="px-1">
                  <Brand role={user.role} />
                </div>
                <nav aria-label="Menu">
                  <NavList items={items} pathname={pathname} onNavigate />
                </nav>
                <div className="grid gap-1 border-t border-border pt-4">
                  <div className="mb-1 flex items-center gap-2.5 px-1">
                    <Avatar name={user.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{user.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                    <ThemeToggle tip="tip-left" />
                  </div>
                  <LogoutButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <p className="min-w-0 flex-1 truncate font-display text-base font-semibold sm:hidden">{current?.label ?? "Realty Adwise"}</p>

          <form action={SEARCH_ACTION[user.role]} method="get" role="search" className="relative hidden max-w-md flex-1 sm:block">
            <label htmlFor="global-search" className="sr-only">
              Search leads
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="global-search"
              name="search"
              type="search"
              placeholder="Search leads by client, mobile or property"
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-subtle hover:border-input focus:border-foreground focus:ring-3 focus:ring-ring/15"
            />
          </form>

          <div className="ml-auto flex items-center gap-1">
            <Link href={SEARCH_ACTION[user.role]} className="grid size-11 place-items-center rounded-lg text-foreground hover:bg-muted sm:hidden" aria-label="Search leads">
              <Search className="size-5" aria-hidden="true" />
            </Link>
            <ThemeToggle className="hidden sm:grid" tip="tip-left" />
          </div>
        </header>

        <main id="main" tabIndex={-1} className="page-enter mx-auto grid max-w-6xl gap-5 px-4 py-5 pb-28 outline-none sm:gap-6 sm:px-6 sm:py-7 sm:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
        <ul className="mx-auto flex max-w-lg">
          {primary.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors", active ? "font-medium text-foreground" : "text-muted-foreground")}
                >
                  {active && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent-ink" />}
                  <item.icon className="size-5" strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
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
