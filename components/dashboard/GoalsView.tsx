"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckDot } from "./CheckDot";
import { api } from "@/lib/api-client";
import { monthLabel } from "@/lib/dates";
import type { Goal, GoalHorizon } from "@/lib/types";

function GoalPanel({
  label,
  horizon,
  goals,
  placeholder,
}: {
  label: string;
  horizon: GoalHorizon;
  goals: Goal[];
  placeholder: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");

  async function toggle(goal: Goal) {
    await api(`/api/goals/${goal.id}`, "PATCH", { done: !goal.done });
    router.refresh();
  }

  async function add() {
    const value = text.trim();
    if (!value) return;
    await api("/api/goals", "POST", { text: value, horizon });
    setText("");
    router.refresh();
  }

  return (
    <div className="rounded-[10px] border border-(--line) bg-(--surf-1) p-[22px]">
      <div className="mb-4 font-mono text-[10.5px] tracking-[1.5px] text-accent-soft">
        {label}
      </div>
      <div className="mb-[14px] flex flex-col gap-[2px]">
        {goals.length === 0 && (
          <div className="pb-2 text-[12px] text-ink-1">Nothing here yet.</div>
        )}
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="group flex items-center gap-3 px-[2px] py-[9px]"
          >
            <button onClick={() => toggle(goal)} className="cursor-pointer">
              <CheckDot done={goal.done} size={16} />
            </button>
            <span
              className={`flex-1 text-[14px] ${
                goal.done ? "text-ink-1 line-through" : "text-ink-3"
              }`}
            >
              {goal.text}
            </span>
            <button
              onClick={async () => {
                await api(`/api/goals/${goal.id}`, "DELETE");
                router.refresh();
              }}
              aria-label={`delete ${goal.text}`}
              className="cursor-pointer font-mono text-[10px] text-ink-1 opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder={placeholder}
        className="w-full rounded-[7px] border border-dashed border-(--line-strong) bg-transparent px-[11px] py-[9px] font-mono text-[11px] text-ink-3 outline-none focus:border-(--accent-line)"
      />
    </div>
  );
}

export function GoalsView({ goals }: { goals: Goal[] }) {
  const week = goals.filter((g) => g.horizon === "week" && !g.done);
  const month = goals.filter((g) => g.horizon === "month" && !g.done);
  const archive = goals
    .filter((g) => g.done)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))
    .slice(0, 15);

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">GOALS</span>
      </div>
      <div className="mb-[22px] grid grid-cols-2 items-start gap-[18px]">
        <GoalPanel
          label="THIS WEEK"
          horizon="week"
          goals={week}
          placeholder="+ add weekly goal"
        />
        <GoalPanel
          label="THIS MONTH"
          horizon="month"
          goals={month}
          placeholder="+ add monthly goal"
        />
      </div>
      <div className="rounded-[10px] border border-(--line-soft) bg-(--surf-2) p-[22px]">
        <div className="mb-4 font-mono text-[10.5px] tracking-[1.5px] text-ink-1">
          ARCHIVE · COMPLETED
        </div>
        {archive.length === 0 ? (
          <div className="text-[12px] text-ink-1">
            Completed goals land here.
          </div>
        ) : (
          <div className="flex flex-col gap-[9px]">
            {archive.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3">
                <span className="text-[11px] text-accent">✓</span>
                <span className="flex-1 text-[13px] text-ink-2 line-through">
                  {goal.text}
                </span>
                <span className="font-mono text-[9.5px] tracking-[1px] text-ink-1">
                  {goal.completed_at ? monthLabel(goal.completed_at.slice(0, 10)) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
