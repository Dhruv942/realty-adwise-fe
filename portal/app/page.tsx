import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { getSession } from "@/lib/session";
import { homePath } from "@/lib/session-cookie";

export default async function Home() {
  const session = await getSession();
  if (session) redirect(homePath[session.user.role]);

  return (
    <AuthLayout eyebrow="Team portal" title="Sign in to continue" lede="Admins manage teams and executives. Executives work their leads.">
      <div className="stack">
        <Link className="btn btn-solid" href="/admin/login">
          Admin sign in
        </Link>
        <Link className="btn btn-line" href="/executive/login">
          Executive sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
