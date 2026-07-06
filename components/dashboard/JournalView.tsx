"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { shortDateLabel } from "@/lib/dates";
import type { DailyLog, Mood } from "@/lib/types";

const MOODS: Mood[] = ["low", "flat", "good"];

const moodColor: Record<string, string> = {
  low: "var(--danger)",
  flat: "var(--warn)",
  good: "var(--accent)",
};

export function JournalView({
  today,
  todayLog,
  entries,
}: {
  today: string;
  todayLog: DailyLog | null;
  entries: DailyLog[];
}) {
  const router = useRouter();
  const [body, setBody] = useState(todayLog?.notes?.journal ?? "");
  const [mood, setMood] = useState<Mood>(todayLog?.mood ?? "good");
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      await api("/api/day", "PUT", { log_date: today, journal: body, mood });
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const history = entries.filter(
    (entry) => entry.log_date !== today && entry.notes?.journal,
  );

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">JOURNAL</span>
      </div>

      <div className="mb-[26px] rounded-[10px] border border-(--line) bg-(--surf-1) p-5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write today's entry…"
          className="h-[110px] w-full bg-transparent font-serif text-[18px] leading-[1.6] text-ink-4 outline-none"
        />
        <div className="mt-3 flex items-center gap-[14px] border-t border-(--line-soft) pt-[14px]">
          <span className="font-mono text-[9.5px] tracking-[1.2px] text-ink-1">
            MOOD
          </span>
          <div className="flex flex-1 items-center gap-2">
            {MOODS.map((option) => (
              <button
                key={option}
                onClick={() => setMood(option)}
                aria-label={`mood: ${option}`}
                className="h-[18px] w-[18px] cursor-pointer rounded-full border"
                style={{
                  background: mood === option ? moodColor[option] : "transparent",
                  borderColor: moodColor[option],
                }}
              />
            ))}
            {savedAt && (
              <span className="ml-2 font-mono text-[9.5px] tracking-[1px] text-accent">
                SAVED {savedAt}
              </span>
            )}
          </div>
          <button
            onClick={save}
            disabled={busy}
            className="cursor-pointer rounded-[7px] bg-accent px-[18px] py-[9px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent disabled:opacity-50"
          >
            SAVE ENTRY
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center font-mono text-[11px] tracking-[1px] text-ink-1">
          PAST ENTRIES APPEAR HERE
        </div>
      ) : (
        <div className="flex flex-col gap-[22px]">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="border-b border-(--line-soft) pb-[22px]"
            >
              <div className="mb-3 flex items-center gap-[10px]">
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{
                    background: entry.mood ? moodColor[entry.mood] : "var(--ink-1)",
                  }}
                />
                <span className="font-mono text-[10.5px] tracking-[1.5px] text-ink-2">
                  {shortDateLabel(entry.log_date)}
                </span>
              </div>
              <div className="font-serif text-[18px] leading-[1.6] text-ink-3">
                {entry.notes.journal}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
