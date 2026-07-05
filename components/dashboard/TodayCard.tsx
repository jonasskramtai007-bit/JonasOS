"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckDot } from "./CheckDot";
import { Panel } from "./Panel";
import { Pill } from "./Pill";
import { api } from "@/lib/api-client";
import type { Task } from "@/lib/types";

export function TodayCard({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function toggle(task: Task) {
    if (pending) return;
    setPending(task.id);
    try {
      await api(`/api/tasks/${task.id}`, "PATCH", {
        completed: !task.completed_at,
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <Panel index="04" title="TODAY" className="p-[22px]">
      {tasks.length === 0 ? (
        <div className="py-2 text-[13px] text-ink-1">
          Nothing scheduled for today — add tasks in the Tasks tab.
        </div>
      ) : (
        <div className="flex flex-col gap-[2px]">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-[13px] border-b border-(--line-soft) px-1 py-[11px]"
            >
              <button
                onClick={() => toggle(task)}
                disabled={pending === task.id}
                aria-label={`toggle ${task.title}`}
                className="disabled:opacity-50"
              >
                <CheckDot done={!!task.completed_at} />
              </button>
              <span
                className={`flex-1 text-[14px] ${
                  task.completed_at ? "text-ink-1 line-through" : "text-ink-4"
                }`}
              >
                {task.title}
              </span>
              {task.category && (
                <span className="font-mono text-[9px] tracking-[1px] text-ink-2">
                  {task.category.toUpperCase()}
                </span>
              )}
              <Pill tone={task.key ? "accent" : "warn"}>
                {task.key ? "KEY" : "TODAY"}
              </Pill>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
