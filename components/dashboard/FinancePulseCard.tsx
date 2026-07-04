import { Panel } from "./Panel";
import { financePulse } from "@/lib/placeholder-data";

export function FinancePulseCard() {
  const line = financePulse.points.map(([x, y]) => `${x},${y}`).join(" L");
  const [lastX, lastY] = financePulse.points[financePulse.points.length - 1];

  return (
    <Panel index="02" title="FINANCE PULSE">
      <div className="mb-[5px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        SAVINGS
      </div>
      <div className="mb-4 flex items-baseline gap-[10px]">
        <span className="font-mono text-[30px] font-medium tracking-[-0.5px] tabular-nums">
          {financePulse.savings}
        </span>
        <span className="font-mono text-[12px] text-accent">
          {financePulse.delta}
        </span>
      </div>
      <svg
        viewBox="0 0 200 44"
        preserveAspectRatio="none"
        className="block h-11 w-full overflow-visible"
      >
        <path
          d={`M${line} L200,44 L0,44 Z`}
          fill="color-mix(in oklab, var(--accent) 9%, transparent)"
        />
        <path
          d={`M${line}`}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={lastX} cy={lastY} r="2.6" fill="var(--accent)" />
      </svg>
      <div className="mt-2 font-mono text-[9.5px] tracking-[1px] text-ink-1">
        {financePulse.rangeLabel}
      </div>
    </Panel>
  );
}
