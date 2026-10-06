import { NotFoundView } from "@/components/NotFoundView";

export default function ManagerNotFound() {
  return (
    <NotFoundView
      title="This lead isn't available"
      message="It may have been deleted, or it belongs to a team you don't manage."
      links={[
        { href: "/manager", label: "Back to overview" },
        { href: "/manager/leads", label: "Leads" },
      ]}
    />
  );
}
