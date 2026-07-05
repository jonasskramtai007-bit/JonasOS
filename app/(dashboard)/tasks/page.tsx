import { TasksView } from "@/components/dashboard/TasksView";
import { listTasks } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await listTasks();
  return <TasksView tasks={tasks} />;
}
