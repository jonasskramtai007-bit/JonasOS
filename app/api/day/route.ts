import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import { localDateISO } from "@/lib/dates";
import { audit } from "@/lib/audit";
import type { DayNotes } from "@/lib/types";

const MOODS = ["low", "flat", "good"];

/**
 * Upserts per-day state in daily_logs. Accepts any subset of
 * { log_date, journal, today_will, habits, mood } and merges it
 * into the existing row's notes jsonb.
 */
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const logDate =
    typeof body.log_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.log_date)
      ? body.log_date
      : localDateISO();

  const db = createServiceClient();
  const { data: existing, error: readError } = await db
    .from("daily_logs")
    .select("id, notes, mood")
    .eq("user_id", USER_ID)
    .eq("log_date", logDate)
    .maybeSingle();
  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }

  const notes: DayNotes = { ...(existing?.notes ?? {}) };
  if (typeof body.journal === "string") notes.journal = body.journal;
  if (typeof body.today_will === "string") notes.today_will = body.today_will;
  if (Array.isArray(body.habits)) {
    const { habits: allowed } = await getSettings();
    notes.habits = body.habits.filter((h: unknown): h is string =>
      typeof h === "string" && allowed.includes(h),
    );
  }
  const mood = MOODS.includes(body.mood) ? body.mood : (existing?.mood ?? null);

  const { data, error } = await db
    .from("daily_logs")
    .upsert(
      { user_id: USER_ID, log_date: logDate, notes, mood },
      { onConflict: "user_id,log_date" },
    )
    .select("id, log_date, notes, mood")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "day.update", "daily_log", data.id, { log_date: logDate });
  return NextResponse.json({ day: data });
}
