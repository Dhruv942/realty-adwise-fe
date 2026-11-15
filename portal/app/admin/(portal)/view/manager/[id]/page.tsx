import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManagerDashboardView } from "@/components/view/ManagerDashboardView";
import { ViewBanner } from "@/components/view/ViewBanner";
import { ApiError } from "@/lib/api";
import { getManagerDashboard } from "@/lib/view";

export const metadata: Metadata = { title: "Manager dashboard" };

async function load(id: string) {
  try {
    return await getManagerDashboard(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export default async function AdminViewManager({ params }: { params: Promise<{ id: string }> }) {
  const data = await load((await params).id);
  return (
    <>
      <ViewBanner name={data.viewing.user.name} roleLabel="Manager" backHref="/admin/view" backLabel="Back to Admin Dashboard" />
      <ManagerDashboardView data={data} executiveHref={(id) => `/admin/view/executive/${id}`} />
    </>
  );
}
