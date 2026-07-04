import { CheckDot } from "./CheckDot";
import { goalsArchive, goalsMonth, goalsWeek } from "@/lib/placeholder-data";

function GoalPanel({
  label,
  goals,
  placeholder,
}: {
  label: string;
  goals: { text: string; done: boolean }[];
  placeholder: string;
}) {
  return (
    <div className="rounded-[14px] border border-(--line) bg-(--surf-1) p-[22px]">
      <div className="mb-4 font-mono text-[10.5px] tracking-[1.5px] text-accent-soft">
        {label}
      </div>
      <div className="mb-[14px] flex flex-col gap-[2px]">
        {goals.map((goal) => (
          <div
            key={goal.text}
            className="flex cursor-pointer items-center gap-3 px-[2px] py-[9px]"
          >
            <CheckDot done={goal.done} size={16} />
            <span
              className={`flex-1 text-[14px] ${
                goal.done ? "text-ink-1 line-through" : "text-ink-3"
              }`}
            >
              {goal.text}
            </span>
          </div>
        ))}
      </div>
      <input
        placeholder={placeholder}
        className="w-full rounded-[8px] border border-dashed border-(--line-strong) bg-transparent px-[11px] py-[9px] font-mono text-[11px] text-ink-3 outline-none focus:border-(--accent-line)"
      />
    </div>
  );
}

export function GoalsView() {
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">GOALS</span>
      </div>
      <div className="mb-[22px] grid grid-cols-2 items-start gap-[18px]">
        <GoalPanel
          label="THIS WEEK"
          goals={goalsWeek}
          placeholder="+ add weekly goal"
        />
        <GoalPanel
          label="THIS MONTH"
          goals={goalsMonth}
          placeholder="+ add monthly goal"
        />
      </div>
      <div className="rounded-[14px] border border-(--line-soft) bg-(--surf-2) p-[22px]">
        <div className="mb-4 font-mono text-[10.5px] tracking-[1.5px] text-ink-1">
          ARCHIVE · COMPLETED
        </div>
        <div className="flex flex-col gap-[9px]">
          {goalsArchive.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="text-[11px] text-accent">✓</span>
              <span className="flex-1 text-[13px] text-ink-2 line-through">
                {item.text}
              </span>
              <span className="font-mono text-[9.5px] tracking-[1px] text-ink-1">
                {item.when}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
