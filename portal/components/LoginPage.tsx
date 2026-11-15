import { login } from "@/lib/actions/auth";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";

type Props = { searchParams: Promise<{ next?: string | string[]; expired?: string }> };

/** The only sign-in screen: email and password. There is no role choice; the account decides the dashboard. */
export async function LoginPage({ searchParams }: Props) {
  const { next, expired } = await searchParams;
  return (
    <AuthLayout eyebrow="Staff portal" title="Welcome back" lede="Sign in with the email and password you were given. You will land on your own dashboard.">
      <div>
        <h2>Sign in</h2>
        <p className="muted mt-1 text-sm">Use your work email and password.</p>
      </div>
      {expired && (
        <p className="notice notice-warn" role="status">
          Your session has ended. Please sign in again.
        </p>
      )}
      <LoginForm action={login} next={typeof next === "string" ? next : undefined} />
    </AuthLayout>
  );
}
