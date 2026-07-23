// Server-side reads. Pages call these; mutations go through /api routes.

import { createServiceClient } from "./supabase/server";
import { USER_ID } from "./config";
import { localDateISO, yesterdayISO, weekStartISO } from "./dates";
import { habitStats } from "./habits";
import { getSettings } from "./settings";
import type {
  DailyLog,
  FinanceSnapshot,
  Goal,
  RawCapture,
  Task,
  WeeklyReview,
} from "./types";

function db() {
  return createServiceClient();
}

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await db()
    .from("tasks")
    .select("*")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: false })
    .limit(200);
  throwIf(error);
  return (data ?? []) as Task[];
}

/** Open tasks for the Today card: urgency=today or key, not completed. */
export async function listTodayTasks(): Promise<Task[]> {
  const { data, error } = await db()
    .from("tasks")
    .select("*")
    .eq("user_id", USER_ID)
    .is("completed_at", null)
    .order("created_at", { ascending: true })
    .limit(200);
  throwIf(error);
  const open = (data ?? []) as Task[];
  return open.filter((t) => t.urgency === "today" || t.key).slice(0, 10);
}

export async function listGoals(): Promise<Goal[]> {
  const { data, error } = await db()
    .from("goals")
    .select("*")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: true })
    .limit(100);
  throwIf(error);
  return (data ?? []) as Goal[];
}

export async function getDailyLog(logDate: string): Promise<DailyLog | null> {
  const { data, error } = await db()
    .from("daily_logs")
    .select("id, log_date, notes, mood")
    .eq("user_id", USER_ID)
    .eq("log_date", logDate)
    .maybeSingle();
  throwIf(error);
  return data as DailyLog | null;
}

export async function listRecentLogs(limit = 60): Promise<DailyLog[]> {
  const { data, error } = await db()
    .from("daily_logs")
    .select("id, log_date, notes, mood")
    .eq("user_id", USER_ID)
    .order("log_date", { ascending: false })
    .limit(limit);
  throwIf(error);
  return (data ?? []) as DailyLog[];
}

export async function listSnapshots(): Promise<FinanceSnapshot[]> {
  const { data, error } = await db()
    .from("finance_snapshots")
    .select("id, month, total, income, spend")
    .eq("user_id", USER_ID)
    .order("month", { ascending: false })
    .limit(24);
  throwIf(error);
  return (data ?? []) as FinanceSnapshot[];
}

/** Unrouted captures (pending) plus the most recently filed ones. */
export async function listInbox(): Promise<{
  pending: RawCapture[];
  filed: RawCapture[];
}> {
  const client = db();
  const [pendingRes, filedRes] = await Promise.all([
    client
      .from("raw_captures")
      .select("*")
      .eq("user_id", USER_ID)
      .is("routed_id", null)
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("raw_captures")
      .select("*")
      .eq("user_id", USER_ID)
      .not("routed_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  throwIf(pendingRes.error);
  throwIf(filedRes.error);
  return {
    pending: (pendingRes.data ?? []) as RawCapture[],
    filed: (filedRes.data ?? []) as RawCapture[],
  };
}

export async function getWeeklyReview(
  weekStart: string,
): Promise<WeeklyReview | null> {
  const { data, error } = await db()
    .from("weekly_reviews")
    .select(
      "id, week_start, wins, slipped, open_loops, next_week_top3, identity_sentence, sealed",
    )
    .eq("user_id", USER_ID)
    .eq("week_start", weekStart)
    .maybeSingle();
  throwIf(error);
  return data as WeeklyReview | null;
}

/** Tasks completed within [startDate, endDate] (inclusive, local dates). */
export async function listCompletedTasksBetween(
  startDate: string,
  endDate: string,
): Promise<Task[]> {
  const { data, error } = await db()
    .from("tasks")
    .select("*")
    .eq("user_id", USER_ID)
    .gte("completed_at", `${startDate}T00:00:00`)
    .lte("completed_at", `${endDate}T23:59:59`)
    .order("completed_at", { ascending: true })
    .limit(100);
  throwIf(error);
  return (data ?? []) as Task[];
}

export async function listLogsBetween(
  startDate: string,
  endDate: string,
): Promise<DailyLog[]> {
  const { data, error } = await db()
    .from("daily_logs")
    .select("id, log_date, notes, mood")
    .eq("user_id", USER_ID)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date", { ascending: true })
    .limit(40);
  throwIf(error);
  return (data ?? []) as DailyLog[];
}

/** Consecutive days ending today/yesterday with at least one habit done. */
export function computeStreak(logs: DailyLog[]): number {
  const habitDays = new Set(
    logs
      .filter((log) => (log.notes?.habits?.length ?? 0) > 0)
      .map((log) => log.log_date),
  );
  let day = localDateISO();
  if (!habitDays.has(day)) day = yesterdayISO(); // today still in progress
  let streak = 0;
  while (habitDays.has(day)) {
    streak++;
    const d = new Date(`${day}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    day = d.toISOString().slice(0, 10);
  }
  return streak;
}

export async function getHomeData() {
  const today = localDateISO();
  const yesterday = yesterdayISO();
  const [todayTasks, goals, todayLog, yesterdayLog, snapshots, recentLogs, settings] =
    await Promise.all([
      listTodayTasks(),
      listGoals(),
      getDailyLog(today),
      getDailyLog(yesterday),
      listSnapshots(),
      listRecentLogs(),
      getSettings(),
    ]);
  return {
    today,
    weekStart: weekStartISO(),
    todayTasks,
    goals,
    todayLog,
    yesterdayLog,
    snapshots,
    streak: computeStreak(recentLogs),
    habitStats: habitStats(recentLogs, settings.habits.length, today),
    settings,
  };
}
