import { login } from "@/lib/actions/auth";
import type { Role } from "@/lib/types";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";

const copy: Record<Role, { eyebrow: string; title: string; lede: string }> = {
  ADMIN: {
    eyebrow: "Admin",
    title: "Manage your teams",
    lede: "Create teams, onboard executives and control who has access.",
  },
  MANAGER: {
    eyebrow: "Manager",
    title: "Lead your team",
    lede: "See your team's leads, highlight the important ones and assign them to executives.",
  },
  EXECUTIVE: {
    eyebrow: "Executive",
    title: "Welcome back",
    lede: "Sign in with the email and password your admin gave you.",
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
        <h2>{text.eyebrow} sign in</h2>
        <p className="muted mt-1 text-sm">Sign in with your work email and password.</p>
      </div>
      {expired && (
        <p className="notice notice-warn" role="status">
          Your session has ended. Please sign in again.
        </p>
      )}
      <LoginForm action={login.bind(null, role)} next={typeof next === "string" ? next : undefined} />
    </AuthLayout>
  );
}
