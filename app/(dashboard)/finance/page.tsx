import { FinanceView } from "@/components/dashboard/FinanceView";
import { listSnapshots } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const snapshots = await listSnapshots();
  return <FinanceView snapshots={snapshots} />;
}
