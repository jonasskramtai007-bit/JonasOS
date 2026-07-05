import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { localDateISO } from "@/lib/dates";
import { audit } from "@/lib/audit";
import { classifyCapture, Classification } from "@/lib/classify";
import type { DayNotes } from "@/lib/types";

/**
 * Capture pipeline: save the raw text first (nothing is ever lost),
 * then classify with Claude and auto-file into tasks / notes /
 * journal / goals. Without ANTHROPIC_API_KEY, or when classification
 * fails, the capture stays in the inbox (routed_to null).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const source = typeof body?.source === "string" ? body.source : "web";

  const db = createServiceClient();
  const { data: capture, error } = await db
    .from("raw_captures")
    .insert({ user_id: USER_ID, source, raw_text: text })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await audit(db, "capture.create", "raw_capture", capture.id);

  const classification = await classifyCapture(text);
  if (!classification) {
    return NextResponse.json({ capture, routed_to: null });
  }

  let routedId: string | null = null;
  try {
    routedId = await routeCapture(db, classification);
  } catch (routeError) {
    console.error("capture routing failed:", routeError);
  }

  const { data: updated } = await db
    .from("raw_captures")
    .update({
      classification,
      routed_to: routedId ? classification.route : null,
      routed_id: routedId,
    })
    .eq("id", capture.id)
    .select()
    .single();

  if (routedId) {
    await audit(db, "capture.route", "raw_capture", capture.id, {
      routed_to: classification.route,
      routed_id: routedId,
    });
  }
  return NextResponse.json({
    capture: updated ?? capture,
    routed_to: routedId ? classification.route : null,
    routed_id: routedId,
  });
}

/** Creates the routed record and returns its id. */
async function routeCapture(
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
