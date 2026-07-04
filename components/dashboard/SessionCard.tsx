import { Panel } from "./Panel";
import { Pill } from "./Pill";
import { routeChips } from "@/lib/placeholder-data";

export function SessionCard() {
  return (
    <Panel index="03" title="SESSION" className="p-6">
      <div className="mb-[6px] text-[28px] font-light leading-[1.25] tracking-[-0.4px]">
        Good morning,{" "}
        <span className="font-serif italic text-accent">Operator</span>
      </div>
      <div className="mb-[22px] flex items-center gap-[14px] font-mono text-[12px] text-ink-2">
        <span className="tracking-[1px]">Friday, July 4</span>
        <span className="text-ink-1">·</span>
        <span className="tracking-[1px] tabular-nums text-ink-3">08:00</span>
      </div>
      <div className="mb-2 font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        TODAY I WILL…
      </div>
      <input
        placeholder="one thing that matters most"
        className="mb-6 w-full border-b border-(--line-strong) bg-transparent pb-[10px] pt-[6px] font-serif text-[19px] italic text-ink-4 outline-none focus:border-accent"
      />
      <div className="mb-[14px] flex gap-[10px]">
        <input
          placeholder="Capture a thought — AI will file it…"
          className="flex-1 rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-[13px] py-[11px] text-[13px] text-ink-4 outline-none focus:border-(--accent-line)"
        />
        <button className="cursor-pointer rounded-[9px] bg-accent px-5 font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent">
          CAPTURE
        </button>
      </div>
      <div className="flex items-center gap-[9px] font-mono text-[9.5px] tracking-[1px]">
        <span className="text-ink-1">FILED →</span>
        {routeChips.map((chip) => (
          <Pill key={chip.label} tone={chip.tone}>
            {chip.label}
          </Pill>
        ))}
      </div>
    </Panel>
  );
}
