import { TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return <TableSkeleton filters={2} cols={4} action={false} />;
}
