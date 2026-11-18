import { NotFoundView } from "@/components/NotFoundView";

export default function AdminNotFound() {
  return (
    <NotFoundView
      title="This record doesn't exist"
      message="It may have been deleted, or the link is wrong. Check the list it came from."
      links={[
        { href: "/admin", label: "Back to overview" },
        { href: "/admin/leads", label: "Leads" },
        { href: "/admin/properties", label: "Properties" },
      ]}
    />
  );
}
