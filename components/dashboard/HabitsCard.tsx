import { Panel } from "./Panel";
import { habits } from "@/lib/placeholder-data";

const RING_CIRCUMFERENCE = 188.5; // 2πr for r=30

export function HabitsCard() {
  const doneCount = habits.filter((habit) => habit.done).length;
  const offset = RING_CIRCUMFERENCE * (1 - doneCount / habits.length);

  return (
    <Panel
      index="05"
      title="HABITS"
      className="p-[22px]"
      right={
        <span className="font-mono text-[9.5px] tracking-[1px] text-ink-1">
          RESETS 00:00
        </span>
      }
    >
      <div className="flex items-center gap-[22px]">
        <div className="grid flex-1 grid-cols-3 gap-[9px]">
          {habits.map((habit) => (
            <div
              key={habit.name}
              className={`cursor-pointer rounded-[9px] border py-[10px] text-center font-mono text-[10px] tracking-[1.2px] ${
                habit.done
                  ? "border-(--accent-line) bg-(--accent-dim) text-accent"
                  : "border-(--line) text-ink-2"
              }`}
            >
              {habit.name}
            </div>
          ))}
        </div>
        <div className="relative h-[88px] w-[88px] shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            <circle
              cx="44"
              cy="44"
              r="30"
              fill="none"
              stroke="var(--line)"
              strokeWidth="5"
            />
            <circle
              cx="44"
              cy="44"
              r="30"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
            <span className="text-[19px] font-medium tabular-nums text-ink-4">
              {doneCount}
            </span>
            <span className="text-[9px] tracking-[1px] text-ink-1">
              / {habits.length}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
