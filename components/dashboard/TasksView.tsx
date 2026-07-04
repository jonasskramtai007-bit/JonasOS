"use client";

import { useState } from "react";
import { Pill } from "./Pill";
import { taskColumns } from "@/lib/placeholder-data";

export function TasksView() {
  const [view, setView] = useState<"kanban" | "list">("kanban");

  return (
    <div>
      <div className="mb-[22px] flex items-center gap-[14px]">
        <div className="flex flex-1 items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
          <span className="text-accent-soft">{"//"}</span>
          <span className="text-ink-3">TASKS</span>
        </div>
        <input
          placeholder="filter tasks…"
          className="w-[220px] rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-3 py-[9px] font-mono text-[11px] text-ink-4 outline-none focus:border-(--accent-line)"
        />
        <div className="flex rounded-[9px] border border-(--line-strong) bg-(--wash) p-[3px]">
          {(["kanban", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`cursor-pointer rounded-[6px] px-3 py-[6px] font-mono text-[10px] tracking-[1px] ${
                view === mode ? "bg-(--accent-dim) text-accent" : "text-ink-2"
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="cursor-pointer rounded-[9px] bg-accent px-4 py-[9px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent">
          + NEW
        </button>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-4 items-start gap-4">
          {taskColumns.map((column) => (
            <div
              key={column.name}
              className="rounded-[12px] border border-(--line-soft) bg-(--surf-2) p-[14px]"
            >
              <div className="mb-[14px] flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[1.5px] text-ink-3">
                  {column.name}
                </span>
                <span className="font-mono text-[10px] text-ink-1">
                  {column.cards.length}
                </span>
              </div>
              <div className="flex flex-col gap-[10px]">
                {column.cards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[10px] border border-(--line) bg-(--surf-4) p-[13px]"
                  >
                    <div className="mb-[11px] text-[13.5px] leading-[1.35] text-ink-4">
                      {card.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-[5px] bg-(--wash) px-[7px] py-[2px] font-mono text-[9px] tracking-[1px] text-ink-2">
                        {card.cat}
                      </span>
                      <Pill tone={card.tone}>{card.pill}</Pill>
                      <span className="ml-auto font-mono text-[10px] text-ink-2">
                        {card.est}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-(--line-soft) bg-(--surf-2)">
          {taskColumns.flatMap((column) =>
            column.cards.map((card) => (
              <div
                key={`${column.name}-${card.title}`}
                className="flex items-center gap-[14px] border-b border-(--line-soft) px-[18px] py-[14px]"
              >
                <span className="w-20 font-mono text-[9px] tracking-[1px] text-ink-1">
                  {column.name}
                </span>
                <span className="flex-1 text-[14px] text-ink-4">
                  {card.title}
                </span>
                <span className="rounded-[5px] bg-(--wash) px-[7px] py-[2px] font-mono text-[9px] tracking-[1px] text-ink-2">
                  {card.cat}
                </span>
                <Pill tone={card.tone}>{card.pill}</Pill>
                <span className="w-13 text-right font-mono text-[11px] text-ink-2">
                  {card.est}
                </span>
              </div>
            )),
          )}
        </div>
      )}
    </div>
  );
}
