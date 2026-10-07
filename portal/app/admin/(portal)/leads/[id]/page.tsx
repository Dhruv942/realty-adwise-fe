import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { assignLeadAction, updateLeadStatusAction } from "@/lib/actions/leads";
import { AutoRefresh } from "@/components/AutoRefresh";
import { getLead, getLeadTimeout, listExecutives } from "@/lib/admin";
import { ApiError } from "@/lib/api";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

async function loadLead(id: string) {
  try {
    return await getLead(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await loadLead(id)).customer.name };
}

export default async function LeadPage({ params, searchParams }: Props) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [lead, executives, timeout] = await Promise.all([loadLead(id), listExecutives({ isActive: "true" }), getLeadTimeout().catch(() => null)]);
  return (
    <>
    <AutoRefresh />
    <LeadDetailView
      lead={lead}
      role="ADMIN"
      backHref="/admin/leads"
      backLabel="Leads"
      statusAction={updateLeadStatusAction.bind(null, lead.id)}
      assign={{ action: assignLeadAction.bind(null, "ADMIN", lead.id), executives: executives.map((e) => ({ id: e.id, name: e.name, designation: e.designation })) }}
      propertyHref={`/admin/properties/${lead.property.id}`}
      created={Boolean(created)}
      slaMinutes={timeout?.minutes}
    />
    </>
  );
}
