import { JournalView } from "@/components/dashboard/JournalView";
import { getDailyLog, listRecentLogs } from "@/lib/db";
import { localDateISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const today = localDateISO();
  const [todayLog, entries] = await Promise.all([
    getDailyLog(today),
    listRecentLogs(30),
  ]);
  return <JournalView today={today} todayLog={todayLog} entries={entries} />;
}
