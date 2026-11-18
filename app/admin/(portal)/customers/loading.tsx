import { TableSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return <TableSkeleton filters={1} cols={5} action={false} />;
}
