import { Panel } from "./Panel";
import { operator } from "@/lib/placeholder-data";

export function OperatorCard() {
  return (
    <Panel index="01" title="OPERATOR">
      <div className="mb-[3px] text-[20px] font-medium tracking-[-0.3px]">
        {operator.name}
      </div>
      <div className="mb-[18px] font-mono text-[11px] tracking-[0.5px] text-ink-2">
        {operator.role}
      </div>
      <div className="mb-4 h-px bg-(--line-soft)" />
      <div className="mb-[6px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        CURRENT FOCUS
      </div>
      <div className="mb-[18px] text-[14px] text-ink-3">{operator.focus}</div>
      <div className="flex items-baseline gap-[9px]">
        <span className="font-mono text-[34px] font-medium tabular-nums text-accent">
          {operator.streak}
        </span>
        <span className="font-mono text-[10px] tracking-[1.4px] text-ink-2">
          DAY STREAK
        </span>
      </div>
    </Panel>
  );
}
