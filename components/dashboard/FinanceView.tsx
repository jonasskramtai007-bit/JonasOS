"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { monthLabel } from "@/lib/dates";
import type { FinanceSnapshot } from "@/lib/types";

function euro(n: number): string {
  return `€${Math.round(n).toLocaleString("en-US")}`;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-[10px] border border-(--line) bg-(--surf-1) p-5">
      <div className="mb-[10px] font-mono text-[9.5px] tracking-[1.4px] text-ink-1">
        {label}
      </div>
      <div
        className={`font-mono text-[26px] font-medium tabular-nums ${accent ? "text-accent" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

export function FinanceView({ snapshots }: { snapshots: FinanceSnapshot[] }) {
  const router = useRouter();
  const [month, setMonth] = useState("");
  const [total, setTotal] = useState("");
  const [income, setIncome] = useState("");
  const [spend, setSpend] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const latest = snapshots[0] ?? null;
  const prior = snapshots[1] ?? null;
  const delta = latest && prior ? latest.total - prior.total : null;
  const saveRate =
    latest?.income && latest.income > 0 && latest.spend !== null
      ? Math.round(((latest.income - (latest.spend ?? 0)) / latest.income) * 100)
      : null;

  async function addSnapshot() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api("/api/finance", "PUT", { month, total, income, spend });
      setMonth("");
      setTotal("");
      setIncome("");
      setSpend("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-[22px] flex items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
        <span className="text-accent-soft">{"//"}</span>
        <span className="text-ink-3">FINANCE</span>
      </div>

      <div className="mb-[18px] rounded-[12px] border border-(--line) bg-(--surf-1) p-[34px]">
        <div className="mb-3 font-mono text-[10px] tracking-[1.6px] text-ink-1">
          TOTAL SAVINGS
        </div>
        {latest ? (
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[60px] font-medium tracking-[-1.5px] tabular-nums">
              {euro(latest.total)}
            </span>
            {delta !== null && (
              <span
                className={`font-mono text-[15px] ${delta >= 0 ? "text-accent" : "text-danger"}`}
              >
                {delta >= 0 ? "▲ +" : "▼ −"}
                {euro(Math.abs(delta))} vs prior month
              </span>
            )}
          </div>
        ) : (
          <div className="text-[14px] text-ink-1">
            No snapshots yet — add the first one below.
          </div>
        )}
      </div>

      <div className="mb-[18px] grid grid-cols-3 gap-[14px]">
        <StatCard
          label="MONTHLY INCOME"
          value={latest?.income != null ? euro(latest.income) : "—"}
        />
        <StatCard
          label="MONTHLY SPEND"
          value={latest?.spend != null ? euro(latest.spend) : "—"}
        />
        <StatCard
          label="SAVE RATE"
          value={saveRate !== null ? `${saveRate}%` : "—"}
          accent
        />
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] items-start gap-[18px]">
        <div className="rounded-[10px] border border-(--line-soft) bg-(--surf-2) p-[22px]">
          <div className="mb-4 font-mono text-[10px] tracking-[1.5px] text-ink-1">
            SNAPSHOT HISTORY
          </div>
          <div className="flex border-b border-(--line-soft) px-1 pb-[10px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
            <span className="flex-1">MONTH</span>
            <span className="w-[90px] text-right">TOTAL</span>
            <span className="w-[90px] text-right">Δ PRIOR</span>
          </div>
          {snapshots.length === 0 && (
            <div className="py-4 text-[12px] text-ink-1">No history yet.</div>
          )}
          {snapshots.map((snap, i) => {
            const prev = snapshots[i + 1];
            const d = prev ? snap.total - prev.total : null;
            return (
              <div
                key={snap.id}
                className="flex items-center border-b border-(--line-soft) px-1 py-[11px] font-mono text-[13px] tabular-nums"
              >
                <span className="flex-1 tracking-[1px] text-ink-3">
                  {monthLabel(snap.month)}
                </span>
                <span className="w-[90px] text-right text-ink-4">
                  {euro(snap.total)}
                </span>
                <span
                  className={`w-[90px] text-right ${
                    d === null ? "text-ink-1" : d >= 0 ? "text-accent" : "text-danger"
                  }`}
                >
                  {d === null ? "—" : `${d >= 0 ? "+" : "−"}${euro(Math.abs(d))}`}
                </span>
              </div>
            );
          })}
        </div>

        <div className="rounded-[10px] border border-(--line) bg-(--surf-1) p-[22px]">
          <div className="mb-4 font-mono text-[10px] tracking-[1.5px] text-accent-soft">
            ADD SNAPSHOT
          </div>
          <div className="mb-[6px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
            MONTH
          </div>
          <input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="2026-07"
            className="mb-[14px] w-full rounded-[7px] border border-(--line-strong) bg-(--surf-3) px-3 py-[10px] font-mono text-[12px] text-ink-4 outline-none focus:border-(--accent-line)"
          />
          <div className="grid grid-cols-3 gap-[10px]">
            <div>
              <div className="mb-[6px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
                TOTAL €
              </div>
              <input
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="2600"
                className="w-full rounded-[7px] border border-(--line-strong) bg-(--surf-3) px-3 py-[10px] font-mono text-[12px] text-ink-4 outline-none focus:border-(--accent-line)"
              />
            </div>
            <div>
              <div className="mb-[6px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
                INCOME €
              </div>
              <input
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="1200"
                className="w-full rounded-[7px] border border-(--line-strong) bg-(--surf-3) px-3 py-[10px] font-mono text-[12px] text-ink-4 outline-none focus:border-(--accent-line)"
              />
            </div>
            <div>
              <div className="mb-[6px] font-mono text-[9px] tracking-[1.2px] text-ink-1">
                SPEND €
              </div>
              <input
                value={spend}
                onChange={(e) => setSpend(e.target.value)}
                placeholder="950"
                className="w-full rounded-[7px] border border-(--line-strong) bg-(--surf-3) px-3 py-[10px] font-mono text-[12px] text-ink-4 outline-none focus:border-(--accent-line)"
              />
            </div>
          </div>
          {error && (
            <p className="mt-3 font-mono text-[10px] tracking-[1px] text-danger">
              {error.toUpperCase()}
            </p>
          )}
          <button
            onClick={addSnapshot}
            disabled={busy || !month.trim() || !total.trim()}
            className="mt-[18px] w-full cursor-pointer rounded-[7px] bg-accent py-[11px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent disabled:opacity-50"
          >
            SAVE SNAPSHOT
          </button>
        </div>
      </div>
    </div>
  );
}
