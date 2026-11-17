import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function ZohoCallbackAlias({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const params = await searchParams;
  const result = params.zoho === "connected" || params.zoho === "error" ? `?zoho=${params.zoho}` : "";
  redirect(`/admin/settings${result}`);
}
