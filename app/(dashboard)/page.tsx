import { FinancePulseCard } from "@/components/dashboard/FinancePulseCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { HabitsCard } from "@/components/dashboard/HabitsCard";
import { JournalCard } from "@/components/dashboard/JournalCard";
import { OperatorCard } from "@/components/dashboard/OperatorCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { TodayCard } from "@/components/dashboard/TodayCard";

export default function HomePage() {
  return (
    <div className="grid grid-cols-[300px_1fr_322px] items-start gap-[18px]">
      <div className="flex flex-col gap-[18px]">
        <OperatorCard />
        <FinancePulseCard />
      </div>
      <div className="flex flex-col gap-[18px]">
        <SessionCard />
        <TodayCard />
        <HabitsCard />
      </div>
      <div className="flex flex-col gap-[18px]">
        <GoalsCard />
        <JournalCard />
      </div>
    </div>
  );
}
