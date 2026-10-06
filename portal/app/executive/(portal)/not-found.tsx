import { NotFoundView } from "@/components/NotFoundView";

export default function ExecutiveNotFound() {
  return (
    <NotFoundView
      title="This lead isn't available"
      message="It may have moved to another executive, or the link is wrong."
      links={[{ href: "/executive", label: "Back to my leads" }]}
    />
  );
}
