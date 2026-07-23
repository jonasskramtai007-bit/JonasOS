"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { shortDateLabel } from "@/lib/dates";
import { useMirror } from "@/lib/use-mirror";
import type { DailyLog, Mood } from "@/lib/types";

const MOODS: Mood[] = ["low", "flat", "good"];

const moodColor: Record<string, string> = {
  low: "var(--danger)",
  flat: "var(--warn)",
  good: "var(--accent)",
};

type TimelineEntry = {
  id: string;
  log_date: string;
  body: string;
  mood: Mood | null;
  isToday: boolean;
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
  const [, startTransition] = useTransition();
  const [body, setBody] = useState(todayLog?.notes?.journal ?? "");
  const [mood, setMood] = useState<Mood>(todayLog?.mood ?? "good");
  const [busy, setBusy] = useState(false);
  // savedBody mirrors the server's stored entry for today, so the
  // "logged" state and today's timeline card update the moment we save.
  const [savedBody, setSavedBody] = useMirror(todayLog?.notes?.journal ?? "");
  const [savedMood, setSavedMood] = useMirror<Mood | null>(todayLog?.mood ?? null);

  const logged = savedBody.trim().length > 0;
  const dirty = body.trim() !== savedBody.trim() || (logged && mood !== savedMood);

  async function save() {
    const snapshot = body.trim();
    if (busy || !snapshot) return;
    setBusy(true);
    const prevBody = savedBody;
    const prevMood = savedMood;
    setSavedBody(snapshot); // optimistic — flips the "logged" state instantly
    setSavedMood(mood);
    try {
      await api("/api/day", "PUT", { log_date: today, journal: snapshot, mood });
      startTransition(() => router.refresh());
    } catch {
      setSavedBody(prevBody);
      setSavedMood(prevMood);
    } finally {
      setBusy(false);
    }
  }

  const past = entries.filter((e) => e.log_date !== today && e.notes?.journal);
  const timeline: TimelineEntry[] = [];
  if (logged) {
    timeline.push({ id: "today", log_date: today, body: savedBody, mood: savedMood, isToday: true });
  }
  for (const e of past) {
    timeline.push({
      id: e.id,
      log_date: e.log_date,
      body: e.notes.journal ?? "",
      mood: e.mood,
      isToday: false,
    });
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">JOURNAL</span>
      </div>

      <div className="mb-[26px] rounded-[10px] border border-(--line) bg-(--surf-1) p-5">
        {/* status: unmistakable confirmation that today's entry is saved */}
        <div className="mb-3 flex items-center gap-[9px] font-mono text-[10px] tracking-[1.2px]">
          {dirty ? (
            <>
              <span className="h-[7px] w-[7px] rounded-full bg-warn" />
              <span className="text-warn">UNSAVED CHANGES</span>
            </>
          ) : logged ? (
            <>
              <span className="h-[7px] w-[7px] rounded-full bg-accent" />
              <span className="text-accent">TODAY&apos;S ENTRY LOGGED</span>
            </>
          ) : (
            <>
              <span className="h-[7px] w-[7px] rounded-full bg-ink-1" />
              <span className="text-ink-1">NO ENTRY YET TODAY</span>
            </>
          )}
        </div>
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
                className="h-[18px] w-[18px] cursor-pointer rounded-full border active:scale-90"
                style={{
                  background: mood === option ? moodColor[option] : "transparent",
                  borderColor: moodColor[option],
                }}
              />
            ))}
          </div>
          <button
            onClick={save}
            disabled={busy || !body.trim() || (logged && !dirty)}
            className="cursor-pointer rounded-[7px] bg-accent px-[18px] py-[9px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent active:scale-95 disabled:opacity-50"
          >
            {logged ? (dirty ? "UPDATE ENTRY" : "SAVED") : "SAVE ENTRY"}
          </button>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center font-mono text-[11px] tracking-[1px] text-ink-1">
          YOUR ENTRIES WILL COLLECT HERE
        </div>
      ) : (
        <div className="flex flex-col gap-[22px]">
          {timeline.map((entry) => (
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
                  {entry.isToday ? "TODAY" : shortDateLabel(entry.log_date)}
                </span>
              </div>
              <div className="whitespace-pre-wrap font-serif text-[18px] leading-[1.6] text-ink-3">
                {entry.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
