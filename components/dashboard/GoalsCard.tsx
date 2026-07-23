"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckDot } from "./CheckDot";
import { Panel } from "./Panel";
import { api } from "@/lib/api-client";
import { useMirror } from "@/lib/use-mirror";
import type { Goal } from "@/lib/types";

function tempGoal(text: string): Goal {
  return {
    id: `temp-${Date.now()}`,
    text,
    horizon: "week",
    done: false,
    completed_at: null,
    completion_consistency: null,
    created_at: new Date().toISOString(),
  };
}

function GoalRows({
  goals,
  onToggle,
}: {
  goals: Goal[];
  onToggle: (goal: Goal) => void;
}) {
  return (
    <div className="flex flex-col gap-[2px]">
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => onToggle(goal)}
          className="flex cursor-pointer items-center gap-[11px] px-[2px] py-[7px] text-left"
        >
          <span className="active:scale-90">
            <CheckDot done={goal.done} size={16} />
          </span>
          <span
            className={`flex-1 text-[13px] ${
              goal.done ? "text-ink-1 line-through" : "text-ink-3"
            }`}
          >
            {goal.text}
          </span>
        </button>
      ))}
    </div>
  );
}

export function GoalsCard({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [items, setItems] = useMirror(goals);
  const [, startTransition] = useTransition();
  const [text, setText] = useState("");
  const refresh = () => startTransition(() => router.refresh());

  const week = items.filter((g) => g.horizon === "week").slice(-5);
  const month = items.filter((g) => g.horizon === "month").slice(-5);

  function toggle(goal: Goal) {
    const done = !goal.done;
    setItems(
      items.map((g) =>
        g.id === goal.id
          ? { ...g, done, completed_at: done ? new Date().toISOString() : null }
          : g,
      ),
    );
    api(`/api/goals/${goal.id}`, "PATCH", { done })
      .then(refresh)
      .catch(() => setItems(goals));
  }

  function add() {
    const value = text.trim();
    if (!value) return;
    setItems([...items, tempGoal(value)]);
    setText("");
    api("/api/goals", "POST", { text: value, horizon: "week" })
      .then(refresh)
      .catch(() => setItems(goals));
  }

  return (
    <Panel index="06" title="GOALS">
      <div className="mb-[10px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        THIS WEEK
      </div>
      <div className="mb-[18px]">
        {week.length === 0 ? (
          <div className="pb-2 text-[12px] text-ink-1">No weekly goals yet.</div>
        ) : (
          <GoalRows goals={week} onToggle={toggle} />
        )}
      </div>
      <div className="mb-[10px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        THIS MONTH
      </div>
      <div className="mb-[14px]">
        {month.length === 0 ? (
          <div className="pb-2 text-[12px] text-ink-1">No monthly goals yet.</div>
        ) : (
          <GoalRows goals={month} onToggle={toggle} />
        )}
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder="+ add weekly goal"
        className="w-full rounded-[7px] border border-dashed border-(--line-strong) bg-transparent px-[11px] py-[9px] font-mono text-[11px] text-ink-3 outline-none focus:border-(--accent-line)"
      />
    </Panel>
  );
}
