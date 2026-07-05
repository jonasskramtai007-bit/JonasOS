import { FinancePulseCard } from "@/components/dashboard/FinancePulseCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { HabitsCard } from "@/components/dashboard/HabitsCard";
import { JournalCard } from "@/components/dashboard/JournalCard";
import { OperatorCard } from "@/components/dashboard/OperatorCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { TIMEZONE } from "@/lib/config";
import { getHomeData } from "@/lib/db";

export const dynamic = "force-dynamic";

function greetingNow(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: TIMEZONE,
    }).format(new Date()),
  );
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const data = await getHomeData();
  const longDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  });

  return (
    <div className="grid grid-cols-[300px_1fr_322px] items-start gap-[18px]">
      <div className="flex flex-col gap-[18px]">
        <OperatorCard streak={data.streak} />
        <FinancePulseCard snapshots={data.snapshots} />
      </div>
      <div className="flex flex-col gap-[18px]">
        <SessionCard
          greeting={greetingNow()}
          longDate={longDate}
          todayWill={data.todayLog?.notes?.today_will ?? ""}
        />
        <TodayCard tasks={data.todayTasks} />
        <HabitsCard done={data.todayLog?.notes?.habits ?? []} />
      </div>
      <div className="flex flex-col gap-[18px]">
        <GoalsCard goals={data.goals.filter((g) => !g.done).concat(data.goals.filter((g) => g.done)).slice(0, 12)} />
        <JournalCard
          todayLogged={!!data.todayLog?.notes?.journal}
          yesterdayPreview={data.yesterdayLog?.notes?.journal ?? null}
        />
      </div>
    </div>
  );
}
