import { CheckDot } from "./CheckDot";
import { Panel } from "./Panel";
import { goalsMonth, goalsWeek } from "@/lib/placeholder-data";

function GoalRows({ goals }: { goals: { text: string; done: boolean }[] }) {
  return (
    <div className="flex flex-col gap-[2px]">
      {goals.map((goal) => (
        <div
          key={goal.text}
          className="flex cursor-pointer items-center gap-[11px] px-[2px] py-[7px]"
        >
          <CheckDot done={goal.done} size={16} />
          <span
            className={`flex-1 text-[13px] ${
              goal.done ? "text-ink-1 line-through" : "text-ink-3"
            }`}
          >
            {goal.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GoalsCard() {
  return (
    <Panel index="06" title="GOALS">
      <div className="mb-[10px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        THIS WEEK
      </div>
      <div className="mb-[18px]">
        <GoalRows goals={goalsWeek} />
      </div>
      <div className="mb-[10px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        THIS MONTH
      </div>
      <div className="mb-[14px]">
        <GoalRows goals={goalsMonth} />
      </div>
      <input
        placeholder="+ add weekly goal"
        className="w-full rounded-[8px] border border-dashed border-(--line-strong) bg-transparent px-[11px] py-[9px] font-mono text-[11px] text-ink-3 outline-none focus:border-(--accent-line)"
      />
    </Panel>
  );
}
