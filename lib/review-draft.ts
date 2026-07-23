// Weekly review AI assistance: an editable pre-filled draft on first
// page load, and the identity sentence generated once, on seal.

import { createServiceClient } from "./supabase/server";
import { USER_ID } from "./config";
import { getSettings } from "./settings";
import { listCompletedTasksBetween, listLogsBetween } from "./db";
import { haikuJSON, haikuText } from "./haiku";
import type { WeeklyReview } from "./types";

function weekEnd(weekStart: string): string {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

export interface WeekData {
  completedTasks: string[];
  habitDone: number;
  habitPossible: number;
  journalEntries: string[];
  daysLogged: number;
}

export async function gatherWeekData(weekStart: string): Promise<WeekData> {
  const end = weekEnd(weekStart);
  const [tasks, logs, settings] = await Promise.all([
    listCompletedTasksBetween(weekStart, end),
    listLogsBetween(weekStart, end),
    getSettings(),
  ]);
  return {
    completedTasks: tasks.map((t) => t.title),
    habitDone: logs.reduce((sum, l) => sum + (l.notes?.habits?.length ?? 0), 0),
    habitPossible: 7 * settings.habits.length,
    journalEntries: logs
      .filter((l) => l.notes?.journal)
      .map((l) => `${l.log_date}: ${l.notes.journal}`),
    daysLogged: logs.length,
  };
}

function weekSummary(data: WeekData): string {
  return [
    `Completed tasks this week (${data.completedTasks.length}): ${
      data.completedTasks.join("; ") || "none"
    }`,
    `Habits: ${data.habitDone} of ${data.habitPossible} possible check-offs (${data.daysLogged} days with any activity)`,
    `Journal entries:\n${data.journalEntries.join("\n") || "none"}`,
  ].join("\n\n");
}

const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    wins: { type: "string", description: "2-4 short lines, each a concrete win from the data" },
    slipped: { type: "string", description: "1-3 short lines on what didn't happen" },
    open_loops: { type: "string", description: "1-3 short lines on unfinished threads" },
  },
  required: ["wins", "slipped", "open_loops"],
  additionalProperties: false,
};

/**
 * If no review row exists for the week and there is any data to draw
 * from, create a DRAFT pre-filled by Haiku. Returns the created row,
 * or null when nothing was generated.
 */
export async function generateReviewDraft(
  weekStart: string,
): Promise<WeeklyReview | null> {
  const data = await gatherWeekData(weekStart);
  if (data.completedTasks.length === 0 && data.daysLogged === 0) return null;

  const draft = await haikuJSON<{ wins: string; slipped: string; open_loops: string }>(
    `You pre-fill a weekly review draft for a personal dashboard. Base every line strictly on the data given — no invented events, no generic filler. Write in the first person, plain and specific. Short lines, no bullets characters needed beyond a leading dash.`,
    weekSummary(data),
    DRAFT_SCHEMA,
  );
  if (!draft) return null;

  const db = createServiceClient();
  const { data: row, error } = await db
    .from("weekly_reviews")
    .upsert(
      {
        user_id: USER_ID,
        week_start: weekStart,
        wins: draft.wins,
        slipped: draft.slipped,
        open_loops: draft.open_loops,
        sealed: false,
      },
      { onConflict: "user_id,week_start" },
    )
    .select(
      "id, week_start, wins, slipped, open_loops, next_week_top3, identity_sentence, sealed",
    )
    .single();
  if (error) {
    console.error("review draft insert failed:", error.message);
    return null;
  }
  return row as WeeklyReview;
}

/**
 * Identity sentence: who you were being this week, evidenced by the
 * data — generated once, on seal.
 */
export async function generateIdentitySentence(
  weekStart: string,
): Promise<string | null> {
  const data = await gatherWeekData(weekStart);
  return haikuText(
    `Based on the week's data, answer: who was this person being this week — not what they planned, what they actually evidenced. One or two sentences, second person ("you were..."). Must reference specifics from the data. No generic praise, no advice, no hedging. If the data shows drift or avoidance, say so plainly.`,
    weekSummary(data),
    256,
  );
}
