import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExecutiveDashboardView } from "@/components/view/ExecutiveDashboardView";
import { ViewBanner } from "@/components/view/ViewBanner";
import { ApiError } from "@/lib/api";
import { getExecutiveDashboard } from "@/lib/view";

export const metadata: Metadata = { title: "Executive dashboard" };

// Someone else's executive (or one that does not exist) is a 404 from the backend: shown as not found.
async function load(id: string) {
  try {
    return await getExecutiveDashboard("MANAGER", id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export default async function ManagerViewExecutive({ params }: { params: Promise<{ id: string }> }) {
  const data = await load((await params).id);
  return (
    <>
      <ViewBanner name={data.viewing.user.name} roleLabel="Executive" backHref="/manager" backLabel="Back to Manager Dashboard" />
      <ExecutiveDashboardView data={data} leadsBase="/manager/leads" />
    </>
  );
}
