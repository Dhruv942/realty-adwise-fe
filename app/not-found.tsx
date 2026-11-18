import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";
import { getSession } from "@/lib/session";
import { homePath } from "@/lib/session-cookie";

export const metadata: Metadata = { title: "Page not found" };

const HOME_LABEL = { ADMIN: "Go to admin overview", MANAGER: "Go to manager overview", EXECUTIVE: "Go to my leads" } as const;

export default async function NotFound() {
  const session = await getSession();
  const links = session ? [{ href: homePath[session.user.role], label: HOME_LABEL[session.user.role] }] : [{ href: "/", label: "Go to sign in" }];
  return (
    <main className="mx-auto grid min-h-dvh max-w-6xl content-center px-4 sm:px-6">
      <NotFoundView title="This page doesn't exist" message="The address may be mistyped, or the page has moved. Use the link below to get back to the portal." links={links} />
    </main>
  );
}
