"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "./Pill";
import { api } from "@/lib/api-client";
import { shortDateLabel } from "@/lib/dates";
import type { RawCapture } from "@/lib/types";

const ROUTES = ["task", "note", "journal", "goal"] as const;

const routeTone = {
  task: "accent",
  goal: "accent",
  note: "muted",
  journal: "warn",
} as const;

export function InboxView({
  pending,
  filed,
}: {
  pending: RawCapture[];
  filed: RawCapture[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function route(capture: RawCapture, to: (typeof ROUTES)[number]) {
    if (busyId) return;
    setBusyId(capture.id);
    setError(null);
    try {
      await api(`/api/inbox/${capture.id}`, "POST", { route: to });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "routing failed");
    } finally {
      setBusyId(null);
    }
  }

  async function discard(capture: RawCapture) {
    if (busyId) return;
    setBusyId(capture.id);
    try {
      await api(`/api/inbox/${capture.id}`, "DELETE");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">INBOX</span>
        {pending.length > 0 && (
          <span className="ml-2 rounded-[5px] bg-(--accent-dim) px-[7px] py-[2px] text-[10px] text-accent">
            {pending.length} PENDING
          </span>
        )}
      </div>

      {error && (
        <p className="mb-4 font-mono text-[10px] tracking-[1px] text-danger">
          {error.toUpperCase()}
        </p>
      )}

      <div className="mb-[26px] rounded-[14px] border border-(--line) bg-(--surf-1) p-[22px]">
        <div className="mb-4 font-mono text-[10px] tracking-[1.5px] text-ink-1">
          PENDING · NOT YET FILED
        </div>
        {pending.length === 0 ? (
          <div className="py-2 text-[13px] text-ink-1">
            Inbox zero — every capture has been filed.
          </div>
        ) : (
          <div className="flex flex-col">
            {pending.map((capture) => (
              <div
                key={capture.id}
                className="flex flex-wrap items-center gap-3 border-b border-(--line-soft) py-3 last:border-b-0"
              >
                <span className="min-w-0 flex-1 text-[14px] leading-snug text-ink-4">
                  {capture.raw_text}
                </span>
                <span className="font-mono text-[9px] tracking-[1px] text-ink-1">
                  {shortDateLabel(capture.created_at.slice(0, 10))}
                </span>
                <span className="flex items-center gap-[6px]">
                  {ROUTES.map((r) => (
                    <button
                      key={r}
                      onClick={() => route(capture, r)}
                      disabled={busyId === capture.id}
                      className="cursor-pointer rounded-[6px] border border-(--line-strong) px-[9px] py-[5px] font-mono text-[9px] tracking-[1px] text-ink-2 hover:border-(--accent-line) hover:text-accent disabled:opacity-40"
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                  <button
                    onClick={() => discard(capture)}
                    disabled={busyId === capture.id}
                    aria-label="discard capture"
                    className="ml-1 cursor-pointer px-1 font-mono text-[11px] text-ink-1 hover:text-danger disabled:opacity-40"
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[14px] border border-(--line-soft) bg-(--surf-2) p-[22px]">
        <div className="mb-4 font-mono text-[10px] tracking-[1.5px] text-ink-1">
          RECENTLY FILED
        </div>
        {filed.length === 0 ? (
          <div className="text-[12px] text-ink-1">
            Captures filed by AI or by hand appear here.
          </div>
        ) : (
          <div className="flex flex-col gap-[9px]">
            {filed.map((capture) => {
              const to = (capture.routed_to ?? "?") as keyof typeof routeTone;
              const manual = capture.classification &&
                (capture.classification as { manual?: boolean }).manual === true;
              return (
                <div key={capture.id} className="flex items-center gap-3">
                  <Pill tone={routeTone[to] ?? "muted"}>
                    {String(capture.routed_to).toUpperCase()}
                  </Pill>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">
                    {capture.raw_text}
                  </span>
                  {manual && (
                    <span className="font-mono text-[8.5px] tracking-[1px] text-ink-1">
                      MANUAL
                    </span>
                  )}
                  <span className="font-mono text-[9px] tracking-[1px] text-ink-1">
                    {shortDateLabel(capture.created_at.slice(0, 10))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
