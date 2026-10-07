import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/AutoRefresh";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { assignLeadAction } from "@/lib/actions/leads";
import { ApiError } from "@/lib/api";
import { getManagerLead, listManagerExecutives } from "@/lib/manager";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

async function load(id: string) {
  try {
    return await getManagerLead(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await load(id)).customer.name };
}

export default async function ManagerLeadPage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [lead, executives] = await Promise.all([load(id), listManagerExecutives()]);
  return (
    <>
    <AutoRefresh />
    <LeadDetailView
      lead={lead}
      role="MANAGER"
      backHref="/manager/leads"
      backLabel="Leads"
      created={Boolean(created)}
      assign={{
        action: assignLeadAction.bind(null, "MANAGER", lead.id),
        executives: executives.filter((e) => e.isActive).map((e) => ({ id: e.id, name: e.name, designation: e.designation })),
      }}
    />
    </>
  );
}
