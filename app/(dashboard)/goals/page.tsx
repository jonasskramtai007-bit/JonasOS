import { GoalsView } from "@/components/dashboard/GoalsView";
import { listGoals } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await listGoals();
  return <GoalsView goals={goals} />;
}
