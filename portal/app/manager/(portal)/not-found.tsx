import { NotFoundView } from "@/components/NotFoundView";

export default function ManagerNotFound() {
  return (
    <NotFoundView
      title="This lead isn't available"
      message="It may have been deleted, or it belongs to an executive who doesn't report to you."
      links={[
        { href: "/manager", label: "Back to overview" },
        { href: "/manager/leads", label: "Leads" },
      ]}
    />
  );
}
