import { Panel } from "./Panel";
import { monthLabel } from "@/lib/dates";
import type { FinanceSnapshot } from "@/lib/types";

function euro(n: number): string {
  return `€${Math.round(n).toLocaleString("en-US")}`;
}

export function FinancePulseCard({ snapshots }: { snapshots: FinanceSnapshot[] }) {
  // snapshots arrive newest-first; sparkline wants oldest→newest
  const series = snapshots.slice(0, 6).reverse();
  const latest = series[series.length - 1];
  const prior = series[series.length - 2];
  const delta = latest && prior ? latest.total - prior.total : null;

  let sparkline: { line: string; lastX: number; lastY: number } | null = null;
  if (series.length >= 2) {
    const totals = series.map((s) => s.total);
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    const scaleY = (t: number) =>
      max === min ? 22 : 40 - ((t - min) / (max - min)) * 34;
    const points = series.map(
      (s, i) =>
        [Math.round((i / (series.length - 1)) * 200), +scaleY(s.total).toFixed(1)] as const,
    );
    sparkline = {
      line: points.map(([x, y]) => `${x},${y}`).join(" L"),
      lastX: points[points.length - 1][0],
      lastY: points[points.length - 1][1],
    };
  }

  return (
    <Panel index="02" title="FINANCE PULSE">
      <div className="mb-[5px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        SAVINGS
      </div>
      {latest ? (
        <>
          <div className="mb-4 flex items-baseline gap-[10px]">
            <span className="font-mono text-[30px] font-medium tracking-[-0.5px] tabular-nums">
              {euro(latest.total)}
            </span>
            {delta !== null && (
              <span
                className={`font-mono text-[12px] ${delta >= 0 ? "text-accent" : "text-danger"}`}
              >
                {delta >= 0 ? "+" : "−"}
                {euro(Math.abs(delta))}
              </span>
            )}
          </div>
          {sparkline && (
            <svg
              viewBox="0 0 200 44"
              preserveAspectRatio="none"
              className="block h-11 w-full overflow-visible"
            >
              <path
                d={`M${sparkline.line} L200,44 L0,44 Z`}
                fill="color-mix(in oklab, var(--accent) 9%, transparent)"
              />
              <path
                d={`M${sparkline.line}`}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={sparkline.lastX} cy={sparkline.lastY} r="2.6" fill="var(--accent)" />
            </svg>
          )}
          <div className="mt-2 font-mono text-[9.5px] tracking-[1px] text-ink-1">
            {series.length > 1
              ? `${monthLabel(series[0].month)} — ${monthLabel(latest.month)} · MANUAL ENTRY`
              : `${monthLabel(latest.month)} · MANUAL ENTRY`}
          </div>
        </>
      ) : (
        <div className="py-2 text-[13px] text-ink-1">
          No snapshots yet — add one in the Finance tab.
        </div>
      )}
    </Panel>
  );
}
