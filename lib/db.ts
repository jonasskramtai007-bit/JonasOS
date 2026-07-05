// Server-side reads. Pages call these; mutations go through /api routes.

import { createServiceClient } from "./supabase/server";
import { USER_ID } from "./config";
import { localDateISO, yesterdayISO, weekStartISO } from "./dates";
import type {
  DailyLog,
  FinanceSnapshot,
  Goal,
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

export async function getWeeklyReview(
  weekStart: string,
): Promise<WeeklyReview | null> {
  const { data, error } = await db()
    .from("weekly_reviews")
    .select("id, week_start, wins, slipped, open_loops, next_week_top3, sealed")
    .eq("user_id", USER_ID)
    .eq("week_start", weekStart)
    .maybeSingle();
  throwIf(error);
  return data as WeeklyReview | null;
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
  const [todayTasks, goals, todayLog, yesterdayLog, snapshots, recentLogs] =
    await Promise.all([
      listTodayTasks(),
      listGoals(),
      getDailyLog(today),
      getDailyLog(yesterday),
      listSnapshots(),
      listRecentLogs(),
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
  };
}
