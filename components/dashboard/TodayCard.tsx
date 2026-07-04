import { CheckDot } from "./CheckDot";
import { Panel } from "./Panel";
import { Pill } from "./Pill";
import { todayTasks } from "@/lib/placeholder-data";

export function TodayCard() {
  return (
    <Panel index="04" title="TODAY" className="p-[22px]">
      <div className="flex flex-col gap-[2px]">
        {todayTasks.map((task) => (
          <div
            key={task.title}
            className="flex items-center gap-[13px] border-b border-(--line-soft) px-1 py-[11px]"
          >
            <CheckDot done={task.done} />
            <span
              className={`flex-1 text-[14px] ${
                task.done ? "text-ink-1 line-through" : "text-ink-4"
              }`}
            >
              {task.title}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-ink-2">
              {task.est}
            </span>
            <Pill tone={task.tone}>{task.pill}</Pill>
          </div>
        ))}
      </div>
    </Panel>
  );
}
