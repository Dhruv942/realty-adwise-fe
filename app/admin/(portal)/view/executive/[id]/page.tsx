import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExecutiveDashboardView } from "@/components/view/ExecutiveDashboardView";
import { ViewBanner } from "@/components/view/ViewBanner";
import { ApiError } from "@/lib/api";
import { getExecutiveDashboard } from "@/lib/view";

export const metadata: Metadata = { title: "Executive dashboard" };

async function load(id: string) {
  try {
    return await getExecutiveDashboard("ADMIN", id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export default async function AdminViewExecutive({ params }: { params: Promise<{ id: string }> }) {
  const data = await load((await params).id);
  return (
    <>
      <ViewBanner name={data.viewing.user.name} roleLabel="Executive" backHref="/admin/view" backLabel="Back to Admin Dashboard" />
      <ExecutiveDashboardView data={data} leadsBase="/admin/leads" />
    </>
  );
}
