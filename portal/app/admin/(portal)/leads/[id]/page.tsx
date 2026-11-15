import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { assignLeadAction, splitLeadAction, transferLeadAction, updateLeadStatusAction } from "@/lib/actions/leads";
import { AutoRefresh } from "@/components/AutoRefresh";
import { getLead, listExecutives } from "@/lib/admin";
import { ApiError } from "@/lib/api";
import { listNotificationsAction } from "@/lib/actions/notifications";

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
  const [lead, executives, notificationList] = await Promise.all([loadLead(id), listExecutives({ isActive: "true" }), listNotificationsAction("ADMIN", "200")]);
  const whatsappMessage = notificationList.notifications.find((notification) => notification.type === "LEAD_CREATED" && notification.entityId === lead.id)?.message;
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
      ownership={{ transferAction: transferLeadAction.bind(null, "ADMIN", lead.id), splitAction: splitLeadAction.bind(null, "ADMIN", lead.id), executives: executives.map((e) => ({ id: e.id, name: e.name, designation: e.designation })) }}
      propertyHref={`/admin/properties/${lead.property.id}`}
      created={Boolean(created)}
      whatsappMessage={whatsappMessage}
    />
    </>
  );
}
