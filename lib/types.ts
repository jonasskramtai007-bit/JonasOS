export type Urgency = "today" | "week" | "month" | "someday";
export type Mood = "low" | "flat" | "good";
export type GoalHorizon = "week" | "month";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  urgency: Urgency;
  key: boolean;
  priority_score: number | null;
  tags: string[];
  category: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  text: string;
  horizon: GoalHorizon;
  done: boolean;
  completed_at: string | null;
  created_at: string;
}

/** Free-form per-day state stored in daily_logs.notes. */
export interface DayNotes {
  journal?: string;
  today_will?: string;
  habits?: string[];
}

export interface DailyLog {
  id: string;
  log_date: string;
  notes: DayNotes;
  mood: Mood | null;
}

export interface FinanceSnapshot {
  id: string;
  month: string;
  total: number;
  income: number | null;
  spend: number | null;
}

export interface RawCapture {
  id: string;
  source: string;
  raw_text: string;
  classification: Record<string, unknown> | null;
  routed_to: string | null;
  routed_id: string | null;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  week_start: string;
  wins: string | null;
  slipped: string | null;
  open_loops: string | null;
  next_week_top3: string | null;
  sealed: boolean;
}
