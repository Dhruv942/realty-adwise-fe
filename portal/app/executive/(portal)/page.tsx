import type { Metadata } from "next";
import { authedRequest } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

export const metadata: Metadata = { title: "Home" };

export default async function ExecutiveHome() {
  // Confirms the token is still valid (deactivation or a password reset sends the user back to login).
  const me = await authedRequest<SessionUser>("EXECUTIVE", "/auth/me");

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Executive</p>
          <h1>Welcome, {me.name}</h1>
        </div>
      </div>
      <section className="panel">
        <h2>Your account</h2>
        <dl className="meta">
          <dt>Name</dt>
          <dd>{me.name}</dd>
          <dt>Email</dt>
          <dd>{me.email}</dd>
          <dt>Role</dt>
          <dd>Executive</dd>
        </dl>
      </section>
    </>
  );
}
