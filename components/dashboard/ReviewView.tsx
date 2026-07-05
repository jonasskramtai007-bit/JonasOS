"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { WeeklyReview } from "@/lib/types";

const SECTIONS = [
  { field: "wins", label: "WINS THIS WEEK", color: "text-accent", placeholder: "what went well…", highlight: false },
  { field: "slipped", label: "WHAT SLIPPED", color: "text-warn", placeholder: "what didn't happen…", highlight: false },
  { field: "open_loops", label: "OPEN LOOPS", color: "text-ink-2", placeholder: "unfinished threads…", highlight: false },
  { field: "next_week_top3", label: "NEXT WEEK · TOP 3", color: "text-accent", placeholder: "1.\n2.\n3.", highlight: true },
] as const;

type Field = (typeof SECTIONS)[number]["field"];

export function ReviewView({
  weekStart,
  weekRange,
  review,
}: {
  weekStart: string;
  weekRange: string;
  review: WeeklyReview | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({
    wins: review?.wins ?? "",
    slipped: review?.slipped ?? "",
    open_loops: review?.open_loops ?? "",
    next_week_top3: review?.next_week_top3 ?? "",
  });
  const [sealed, setSealed] = useState(review?.sealed ?? false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function save(extra?: { sealed: boolean }) {
    setStatus("saving");
    try {
      await api("/api/review", "PUT", {
        week_start: weekStart,
        ...values,
        ...extra,
      });
      if (extra?.sealed) setSealed(true);
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("idle");
    }
  }

  async function sealWeek() {
    if (sealed) return;
    await save({ sealed: true });
  }

  const statusLabel = sealed
    ? "SEALED"
    : status === "saving"
      ? "SAVING…"
      : status === "saved"
        ? "SAVED"
        : "DRAFT";

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6 flex items-center gap-[14px]">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
            <span className="text-accent-soft">{"//"}</span>
            <span className="text-ink-1">WEEKLY REVIEW</span>
          </div>
          <div className="font-serif text-[30px] italic text-ink-4">
            Week of {weekRange}
          </div>
        </div>
        <div
          className={`flex items-center gap-2 font-mono text-[10px] tracking-[1px] ${
            sealed ? "text-accent" : "text-warn"
          }`}
        >
          <span className="h-[6px] w-[6px] rounded-full bg-current" />
          {statusLabel}
        </div>
        <button
          onClick={sealWeek}
          disabled={sealed}
          className="cursor-pointer rounded-[9px] bg-accent px-[18px] py-[10px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent disabled:opacity-40"
        >
          {sealed ? "WEEK SEALED" : "SEAL WEEK"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
        {SECTIONS.map((section) => (
          <div
            key={section.field}
            className={`rounded-[14px] border bg-(--surf-1) p-5 ${
              section.highlight ? "border-(--accent-line)" : "border-(--line)"
            }`}
          >
            <div
              className={`mb-[14px] font-mono text-[10px] tracking-[1.5px] ${section.color}`}
            >
              {section.label}
            </div>
            <textarea
              value={values[section.field]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [section.field]: e.target.value }))
              }
              onBlur={() => !sealed && save()}
              readOnly={sealed}
              placeholder={section.placeholder}
              className="h-[150px] w-full bg-transparent text-[14px] leading-[1.6] text-ink-3 outline-none read-only:opacity-70"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
