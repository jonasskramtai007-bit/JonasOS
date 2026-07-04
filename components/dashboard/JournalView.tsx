"use client";

import { useState } from "react";
import { journal } from "@/lib/placeholder-data";

const MOODS = ["low", "flat", "good"] as const;

const moodColor: Record<string, string> = {
  low: "var(--danger)",
  flat: "var(--warn)",
  good: "var(--accent)",
};

export function JournalView() {
  const [mood, setMood] = useState<string>("good");

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">JOURNAL</span>
      </div>

      <div className="mb-[26px] rounded-[14px] border border-(--line) bg-(--surf-1) p-5">
        <textarea
          placeholder="Write today's entry…"
          className="h-[110px] w-full bg-transparent font-serif text-[18px] leading-[1.6] text-ink-4 outline-none"
        />
        <div className="mt-3 flex items-center gap-[14px] border-t border-(--line-soft) pt-[14px]">
          <span className="font-mono text-[9.5px] tracking-[1.2px] text-ink-1">
            MOOD
          </span>
          <div className="flex flex-1 gap-2">
            {MOODS.map((option) => (
              <button
                key={option}
                onClick={() => setMood(option)}
                aria-label={`mood: ${option}`}
                className="h-[18px] w-[18px] cursor-pointer rounded-full border"
                style={{
                  background:
                    mood === option ? moodColor[option] : "transparent",
                  borderColor: moodColor[option],
                }}
              />
            ))}
          </div>
          <button className="cursor-pointer rounded-[9px] bg-accent px-[18px] py-[9px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent">
            SAVE ENTRY
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[22px]">
        {journal.entries.map((entry) => (
          <div
            key={entry.date}
            className="border-b border-(--line-soft) pb-[22px]"
          >
            <div className="mb-3 flex items-center gap-[10px]">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: moodColor[entry.mood] ?? "var(--ink-1)" }}
              />
              <span className="font-mono text-[10.5px] tracking-[1.5px] text-ink-2">
                {entry.date}
              </span>
            </div>
            <div className="font-serif text-[18px] leading-[1.6] text-ink-3">
              {entry.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
