import { TIMEZONE } from "./config";

/** YYYY-MM-DD for the given instant in the configured timezone. */
export function localDateISO(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function yesterdayISO(): string {
  return shiftISO(localDateISO(), -1);
}

/** Monday of the week containing today (configured timezone). */
export function weekStartISO(): string {
  const today = localDateISO();
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return shiftISO(today, dow === 0 ? -6 : 1 - dow);
}

/** "JUN 29 — JUL 05" for the week starting at the given Monday. */
export function weekRangeLabel(weekStart: string): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`)
      .toLocaleDateString("en-GB", {
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
      })
      .toUpperCase();
  return `${fmt(weekStart)} — ${fmt(shiftISO(weekStart, 6))}`;
}

/** "THU 03 JUL" from a YYYY-MM-DD date. */
export function shortDateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`)
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    })
    .replace(",", "")
    .toUpperCase();
}

/** "MAY 2026" from a YYYY-MM-DD month date. */
export function monthLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`)
    .toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
}
