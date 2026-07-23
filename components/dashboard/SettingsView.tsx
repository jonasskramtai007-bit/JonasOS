"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { Settings } from "@/lib/settings";

const inputClass =
  "w-full rounded-[7px] border border-(--line-strong) bg-(--surf-3) px-3 py-[10px] text-[13px] text-ink-4 outline-none focus:border-(--accent-line)";
const labelClass =
  "mb-[6px] block font-mono text-[9px] tracking-[1.2px] text-ink-1";

export function SettingsView({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [name, setName] = useState(settings.name);
  const [role, setRole] = useState(settings.role);
  const [focus, setFocus] = useState(settings.focus);
  const [habits, setHabits] = useState<string[]>(settings.habits);
  const [newHabit, setNewHabit] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      await api("/api/settings", "PUT", {
        profile: { name, role, focus },
        habits,
      });
      setStatus("saved");
      router.refresh();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "save failed");
    }
  }

  function addHabit() {
    const h = newHabit.trim().toUpperCase().slice(0, 12);
    if (!h || habits.includes(h) || habits.length >= 9) return;
    setHabits([...habits, h]);
    setNewHabit("");
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">SETTINGS</span>
      </div>

      <div className="mb-[18px] rounded-[10px] border border-(--line) bg-(--surf-1) p-[22px]">
        <div className="mb-4 font-mono text-[10px] tracking-[1.5px] text-accent-soft">
          OPERATOR
        </div>
        <label className={labelClass}>NAME</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} mb-[14px]`} />
        <label className={labelClass}>ROLE · LOCATION</label>
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="STUDENT / RUNNER · VILNIUS" className={`${inputClass} mb-[14px]`} />
        <label className={labelClass}>CURRENT FOCUS</label>
        <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="the one thing this season is about" className={inputClass} />
      </div>

      <div className="mb-[18px] rounded-[10px] border border-(--line) bg-(--surf-1) p-[22px]">
        <div className="mb-2 font-mono text-[10px] tracking-[1.5px] text-accent-soft">
          DAILY HABITS
        </div>
        <p className="mb-4 text-[12px] leading-relaxed text-ink-1">
          These are the cells on the Habits card. Renaming or removing a habit
          doesn&apos;t erase history — past days keep what was checked. Max 9.
        </p>
        <div className="mb-[14px] flex flex-wrap gap-2">
          {habits.map((habit) => (
            <span
              key={habit}
              className="flex items-center gap-2 rounded-[7px] border border-(--line-strong) px-3 py-[7px] font-mono text-[10px] tracking-[1.2px] text-ink-3"
            >
              {habit}
              <button
                onClick={() => setHabits(habits.filter((h) => h !== habit))}
                aria-label={`remove ${habit}`}
                className="cursor-pointer text-ink-1 hover:text-danger"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-[10px]">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="+ add habit (e.g. STRETCH)"
            className={`${inputClass} flex-1`}
          />
          <button
            onClick={addHabit}
            className="cursor-pointer rounded-[7px] border border-(--line-strong) px-4 font-mono text-[10px] tracking-[1.5px] text-ink-3 hover:border-(--accent-line) hover:text-accent"
          >
            ADD
          </button>
        </div>
      </div>

      <div className="flex items-center gap-[14px]">
        <button
          onClick={save}
          disabled={status === "saving" || !name.trim() || habits.length === 0}
          className="cursor-pointer rounded-[7px] bg-accent px-5 py-[11px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent disabled:opacity-50"
        >
          {status === "saving" ? "SAVING…" : "SAVE SETTINGS"}
        </button>
        {status === "saved" && (
          <span className="font-mono text-[10px] tracking-[1px] text-accent">SAVED</span>
        )}
        {error && (
          <span className="font-mono text-[10px] tracking-[1px] text-danger">
            {error.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
