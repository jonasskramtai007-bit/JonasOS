"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "./Panel";
import { api } from "@/lib/api-client";
import { HABITS } from "@/lib/config";
import { pct } from "@/lib/habits";
import type { HabitStats } from "@/lib/habits";

const RING_CIRCUMFERENCE = 188.5; // 2πr for r=30

export function HabitsCard({
  done,
  stats,
}: {
  done: string[];
  stats: HabitStats;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<string[]>(done);
  const [busy, setBusy] = useState(false);

  async function toggle(habit: string) {
    if (busy) return;
    const next = current.includes(habit)
      ? current.filter((h) => h !== habit)
      : [...current, habit];
    setCurrent(next); // optimistic
    setBusy(true);
    try {
      await api("/api/day", "PUT", { habits: next });
      router.refresh();
    } catch {
      setCurrent(current); // roll back
    } finally {
      setBusy(false);
    }
  }

  const doneCount = current.length;
  const offset = RING_CIRCUMFERENCE * (1 - doneCount / HABITS.length);

  return (
    <Panel
      index="05"
      title="HABITS"
      className="p-[22px]"
      right={
        <span className="font-mono text-[9.5px] tracking-[1px] text-ink-1">
          7D <span className="tabular-nums text-ink-3">{pct(stats.rate7)}</span>
          <span className="mx-2 text-ink-1">·</span>RESETS 00:00
        </span>
      }
    >
      <div className="flex items-center gap-4 max-sm:flex-col sm:gap-[22px]">
        <div className="grid w-full flex-1 grid-cols-3 gap-[9px]">
          {HABITS.map((habit) => {
            const isDone = current.includes(habit);
            return (
              <button
                key={habit}
                onClick={() => toggle(habit)}
                className={`cursor-pointer rounded-[7px] border py-[10px] text-center font-mono text-[10px] tracking-[1.2px] ${
                  isDone
                    ? "border-(--accent-line) bg-(--accent-dim) text-accent"
                    : "border-(--line) text-ink-2"
                }`}
              >
                {habit}
              </button>
            );
          })}
        </div>
        <div className="relative h-[88px] w-[88px] shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            <circle cx="44" cy="44" r="30" fill="none" stroke="var(--line)" strokeWidth="5" />
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
              / {HABITS.length}
            </span>
          </div>
        </div>
      </div>

      {/* 30-day rolling consistency */}
      <div className="mt-[18px] flex items-center gap-[14px] border-t border-(--line-soft) pt-[14px]">
        <span className="shrink-0 font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
          30D{" "}
          <span className="tabular-nums text-ink-3">{pct(stats.rate30)}</span>
        </span>
        <svg
          viewBox="0 0 200 24"
          preserveAspectRatio="none"
          className="block h-[22px] min-w-0 flex-1"
        >
          <polyline
            points={stats.series30
              .map(
                (count, i) =>
                  `${((i / (stats.series30.length - 1)) * 200).toFixed(1)},${(
                    22 - (count / HABITS.length) * 20
                  ).toFixed(1)}`,
              )
              .join(" ")}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>
    </Panel>
  );
}
