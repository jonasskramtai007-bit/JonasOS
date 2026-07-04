import { finance } from "@/lib/placeholder-data";

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[14px] border border-(--line) bg-(--surf-1) p-5">
      <div className="mb-[10px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        {label}
      </div>
      <div
        className={`font-mono text-[26px] font-medium tabular-nums ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function FinanceView() {
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">FINANCE</span>
      </div>

      <div className="mb-[18px] rounded-[16px] border border-(--line) bg-(--surf-1) p-[34px]">
        <div className="mb-3 font-mono text-[10px] tracking-[1.6px] text-ink-1">
          TOTAL SAVINGS
        </div>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[60px] font-medium tracking-[-1.5px] tabular-nums">
            {finance.total}
          </span>
          <span className="font-mono text-[15px] text-accent">
            {finance.deltaLine}
          </span>
        </div>
      </div>

      <div className="mb-[18px] grid grid-cols-3 gap-[14px]">
        <StatCard label="MONTHLY INCOME" value={finance.income} />
        <StatCard label="MONTHLY SPEND" value={finance.spend} />
        <StatCard label="SAVE RATE" value={finance.saveRate} accent />
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] items-start gap-[18px]">
        <div className="rounded-[14px] border border-(--line-soft) bg-(--surf-2) p-[22px]">
          <div className="mb-4 font-mono text-[10px] tracking-[1.5px] text-ink-1">
            SNAPSHOT HISTORY
          </div>
          <div className="flex border-b border-(--line-soft) px-1 pb-[10px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
            <span className="flex-1">MONTH</span>
            <span className="w-[90px] text-right">TOTAL</span>
            <span className="w-[90px] text-right">Δ PRIOR</span>
          </div>
          {finance.snapshots.map((snap) => (
            <div
              key={snap.month}
              className="flex items-center border-b border-(--line-soft) px-1 py-[11px] font-mono text-[13px] tabular-nums"
            >
              <span className="flex-1 tracking-[1px] text-ink-3">
                {snap.month}
              </span>
              <span className="w-[90px] text-right text-ink-4">
                {snap.total}
              </span>
              <span
                className={`w-[90px] text-right ${
                  snap.up ? "text-accent" : "text-danger"
                }`}
              >
                {snap.delta}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-[14px] border border-(--line) bg-(--surf-1) p-[22px]">
          <div className="mb-4 font-mono text-[10px] tracking-[1.5px] text-accent-soft">
            ADD SNAPSHOT
          </div>
          <div className="mb-[6px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
            MONTH
          </div>
          <input
            placeholder="JUL 2026"
            className="mb-[14px] w-full rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-3 py-[10px] font-mono text-[12px] text-ink-4 outline-none focus:border-(--accent-line)"
          />
          <div className="mb-[6px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
            TOTAL €
          </div>
          <input
            placeholder="2600"
            className="mb-[18px] w-full rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-3 py-[10px] font-mono text-[12px] text-ink-4 outline-none focus:border-(--accent-line)"
          />
          <button className="w-full cursor-pointer rounded-[9px] bg-accent py-[11px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent">
            SAVE SNAPSHOT
          </button>
        </div>
      </div>
    </div>
  );
}
