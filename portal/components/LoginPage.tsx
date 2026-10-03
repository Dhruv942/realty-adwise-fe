import Link from "next/link";
import { login } from "@/lib/actions/auth";
import type { Role } from "@/lib/types";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";

const copy: Record<Role, { eyebrow: string; title: string; lede: string; other: { href: string; label: string } }> = {
  ADMIN: {
    eyebrow: "Admin",
    title: "Manage your teams",
    lede: "Create teams, onboard executives and control who has access.",
    other: { href: "/executive/login", label: "Executive? Sign in here" },
  },
  EXECUTIVE: {
    eyebrow: "Executive",
    title: "Welcome back",
    lede: "Sign in with the email and password your admin gave you.",
    other: { href: "/admin/login", label: "Admin? Sign in here" },
  },
};

type Props = {
  role: Role;
  searchParams: Promise<{ next?: string | string[]; expired?: string }>;
};

export async function LoginPage({ role, searchParams }: Props) {
  const { next, expired } = await searchParams;
  const text = copy[role];
  return (
    <AuthLayout eyebrow={text.eyebrow} title={text.title} lede={text.lede}>
      <div>
        <p className="eyebrow">{text.eyebrow} sign in</p>
        <h2>Sign in</h2>
      </div>
      {expired && (
        <p className="notice notice-error" role="status">
          Your session has ended. Please sign in again.
        </p>
      )}
      <LoginForm action={login.bind(null, role)} next={typeof next === "string" ? next : undefined} />
      <Link className="auth-switch" href={text.other.href}>
        {text.other.label}
      </Link>
    </AuthLayout>
  );
}
