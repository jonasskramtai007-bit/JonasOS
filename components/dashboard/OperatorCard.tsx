import { Panel } from "./Panel";
import { PROFILE } from "@/lib/config";
import { pct } from "@/lib/habits";

export function OperatorCard({
  streak,
  rate7,
}: {
  streak: number;
  rate7: number;
}) {
  return (
    <Panel index="01" title="OPERATOR">
      <div className="mb-[3px] text-[20px] font-medium tracking-[-0.3px]">
        {PROFILE.name}
      </div>
      <div className="mb-[18px] font-mono text-[11px] tracking-[0.5px] text-ink-2">
        {PROFILE.role}
      </div>
      <div className="mb-4 h-px bg-(--line-soft)" />
      <div className="mb-[6px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        CURRENT FOCUS
      </div>
      <div className="mb-[18px] text-[14px] text-ink-3">{PROFILE.focus}</div>
      <div className="flex items-baseline gap-[9px]">
        <span className="font-mono text-[34px] font-medium tabular-nums text-accent">
          {streak}
        </span>
        <span className="font-mono text-[10px] tracking-[1.4px] text-ink-2">
          DAY STREAK
        </span>
      </div>
      <div className="mt-2 font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        7D CONSISTENCY{" "}
        <span className="tabular-nums text-ink-3">{pct(rate7)}</span>
      </div>
    </Panel>
  );
}
