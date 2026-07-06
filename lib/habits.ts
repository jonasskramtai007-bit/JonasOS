// Shared derived habit stats — the single source both the Habits card
// and anything else on Home read from.

import { HABITS } from "./config";
import { localDateISO } from "./dates";
import type { DailyLog } from "./types";

export interface HabitStats {
  /** rolling 7-day completion rate, 0..1 */
  rate7: number;
  /** rolling 30-day completion rate, 0..1 */
  rate30: number;
  /** per-day completed counts for the last 30 days, oldest first */
  series30: number[];
}

function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Rate over the `days` ending at `endDate` (inclusive). */
export function consistencyRate(
  logs: DailyLog[],
  days: number,
  endDate: string = localDateISO(),
): number {
  const byDate = new Map(logs.map((l) => [l.log_date, l.notes?.habits?.length ?? 0]));
  let done = 0;
  for (let i = 0; i < days; i++) {
    done += byDate.get(shiftISO(endDate, -i)) ?? 0;
  }
  return done / (days * HABITS.length);
}

export function habitStats(
  logs: DailyLog[],
  today: string = localDateISO(),
): HabitStats {
  const byDate = new Map(logs.map((l) => [l.log_date, l.notes?.habits?.length ?? 0]));
  const series30: number[] = [];
  for (let i = 29; i >= 0; i--) {
    series30.push(byDate.get(shiftISO(today, -i)) ?? 0);
  }
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  return {
    rate7: sum(series30.slice(-7)) / (7 * HABITS.length),
    rate30: sum(series30) / (30 * HABITS.length),
    series30,
  };
}

export const pct = (rate: number) => `${Math.round(rate * 100)}%`;
