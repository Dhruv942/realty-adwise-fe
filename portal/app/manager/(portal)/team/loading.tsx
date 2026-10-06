import { TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return <TableSkeleton filters={0} cols={3} action={false} />;
}
