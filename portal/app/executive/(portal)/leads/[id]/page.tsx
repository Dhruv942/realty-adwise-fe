import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { updateMyLeadStatusAction } from "@/lib/actions/leads";
import { ApiError } from "@/lib/api";
import { getMyLead } from "@/lib/executive";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  try {
    return await getMyLead(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await load(id)).customer.name };
}

export default async function MyLeadPage({ params }: Props) {
  const { id } = await params;
  const lead = await load(id);
  return <LeadDetailView lead={lead} role="EXECUTIVE" backHref="/executive" backLabel="My leads" statusAction={updateMyLeadStatusAction.bind(null, lead.id)} />;
}
