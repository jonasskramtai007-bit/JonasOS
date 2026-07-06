// Shared routing: creates the destination record for a capture.
// Used by the AI pipeline (/api/capture) and manual inbox routing.

import { SupabaseClient } from "@supabase/supabase-js";
import { USER_ID } from "./config";
import { localDateISO } from "./dates";
import { audit } from "./audit";
import type { Classification } from "./classify";
import type { DayNotes } from "./types";

/** Creates the routed record and returns its id. */
export async function routeCapture(
  db: SupabaseClient,
  c: Classification,
): Promise<string | null> {
  if (c.route === "task") {
    const { data, error } = await db
      .from("tasks")
      .insert({
        user_id: USER_ID,
        title: c.title,
        description: c.body === c.title ? null : c.body,
        urgency: c.urgency,
        category: c.category,
        tags: c.tags,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await audit(db, "task.create", "task", data.id, { via: "capture" });
    return data.id;
  }

  if (c.route === "note") {
    const { data, error } = await db
      .from("notes")
      .insert({ user_id: USER_ID, title: c.title, body: c.body, tags: c.tags })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await audit(db, "note.create", "note", data.id, { via: "capture" });
    return data.id;
  }

  if (c.route === "goal") {
    const { data, error } = await db
      .from("goals")
      .insert({ user_id: USER_ID, text: c.title, horizon: c.horizon })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await audit(db, "goal.create", "goal", data.id, { via: "capture" });
    return data.id;
  }

  // journal: append to today's entry
  const logDate = localDateISO();
  const { data: existing, error: readError } = await db
    .from("daily_logs")
    .select("id, notes, mood")
    .eq("user_id", USER_ID)
    .eq("log_date", logDate)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const notes: DayNotes = { ...(existing?.notes ?? {}) };
  notes.journal = notes.journal ? `${notes.journal}\n\n${c.body}` : c.body;

  const { data, error } = await db
    .from("daily_logs")
    .upsert(
      {
        user_id: USER_ID,
        log_date: logDate,
        notes,
        mood: c.mood ?? existing?.mood ?? null,
      },
      { onConflict: "user_id,log_date" },
    )
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await audit(db, "day.update", "daily_log", data.id, { via: "capture" });
  return data.id;
}

/** A neutral classification for manually routed captures. */
export function manualClassification(
  text: string,
  route: Classification["route"],
): Classification {
  return {
    route,
    title: text.length > 80 ? `${text.slice(0, 77)}…` : text,
    body: text,
    urgency: "week",
    category: null,
    tags: [],
    horizon: "week",
    mood: null,
  };
}
