"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "./Panel";
import { Pill } from "./Pill";
import { api } from "@/lib/api-client";
import { PROFILE } from "@/lib/config";

export function SessionCard({
  greeting,
  longDate,
  todayWill,
}: {
  greeting: string;
  longDate: string;
  todayWill: string;
}) {
  const router = useRouter();
  const [will, setWill] = useState(todayWill);
  const [capture, setCapture] = useState("");
  const [filed, setFiled] = useState<{ route: string; at: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveWill() {
    if (will === todayWill) return;
    await api("/api/day", "PUT", { today_will: will });
    router.refresh();
  }

  async function doCapture() {
    const text = capture.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const result = await api<{ routed_to: string | null }>(
        "/api/capture",
        "POST",
        { text },
      );
      setCapture("");
      setFiled({
        route: (result.routed_to ?? "inbox").toUpperCase(),
        at: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel index="03" title="SESSION" className="p-6">
      <div className="mb-[6px] text-[28px] font-light leading-[1.25] tracking-[-0.4px]">
        {greeting},{" "}
        <span className="font-serif italic text-accent">{PROFILE.name}</span>
      </div>
      <div className="mb-[22px] flex items-center gap-[14px] font-mono text-[12px] text-ink-2">
        <span className="tracking-[1px]">{longDate}</span>
      </div>
      <div className="mb-2 font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        TODAY I WILL…
      </div>
      <input
        value={will}
        onChange={(e) => setWill(e.target.value)}
        onBlur={saveWill}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        placeholder="one thing that matters most"
        className="mb-6 w-full border-b border-(--line-strong) bg-transparent pb-[10px] pt-[6px] font-serif text-[19px] italic text-ink-4 outline-none focus:border-accent"
      />
      <div className="mb-[14px] flex gap-[10px]">
        <input
          value={capture}
          onChange={(e) => setCapture(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doCapture()}
          placeholder="Capture a thought — AI will file it…"
          className="flex-1 rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-[13px] py-[11px] text-[13px] text-ink-4 outline-none focus:border-(--accent-line)"
        />
        <button
          onClick={doCapture}
          disabled={busy}
          className="cursor-pointer rounded-[9px] bg-accent px-5 font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent disabled:opacity-50"
        >
          {busy ? "FILING…" : "CAPTURE"}
        </button>
      </div>
      <div className="flex items-center gap-[9px] font-mono text-[9.5px] tracking-[1px]">
        <span className="text-ink-1">FILED →</span>
        {filed ? (
          <Pill tone="accent">
            {filed.route} · {filed.at}
          </Pill>
        ) : (
          <>
            <Pill tone="muted">TASK</Pill>
            <Pill tone="muted">NOTE</Pill>
            <Pill tone="muted">JOURNAL</Pill>
            <Pill tone="muted">GOAL</Pill>
          </>
        )}
      </div>
    </Panel>
  );
}
