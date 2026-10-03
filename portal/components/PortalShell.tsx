import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";

type Props = {
  user: SessionUser;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
};

export function PortalShell({ user, nav, children }: Props) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link href={nav[0]?.href ?? "/"} className="brand">
            Realty Adwise
            <span>{user.role === "ADMIN" ? "Admin" : "Executive"}</span>
          </Link>
          <nav className="nav" aria-label="Main">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="who">
            <span title={user.email}>{user.name}</span>
            <form action={logout}>
              <button type="submit" className="link-btn">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="wrap main">{children}</main>
    </div>
  );
}
