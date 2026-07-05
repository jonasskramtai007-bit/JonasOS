import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { weekStartISO } from "@/lib/dates";
import { audit } from "@/lib/audit";

const FIELDS = ["wins", "slipped", "open_loops", "next_week_top3"] as const;

/** Upserts the weekly review; { sealed: true } seals it. */
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const weekStart =
    typeof body.week_start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.week_start)
      ? body.week_start
      : weekStartISO();

  const db = createServiceClient();
  const { data: existing, error: readError } = await db
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }
  if (existing?.sealed && body.sealed !== false) {
    return NextResponse.json({ error: "week is sealed" }, { status: 409 });
  }

  const row: Record<string, unknown> = {
    user_id: USER_ID,
    week_start: weekStart,
  };
  for (const field of FIELDS) {
    row[field] =
      typeof body[field] === "string" ? body[field] : (existing?.[field] ?? null);
  }
  row.sealed = typeof body.sealed === "boolean" ? body.sealed : (existing?.sealed ?? false);

  const { data, error } = await db
    .from("weekly_reviews")
    .upsert(row, { onConflict: "user_id,week_start" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, row.sealed ? "review.seal" : "review.update", "weekly_review", data.id, {
    week_start: weekStart,
  });
  return NextResponse.json({ review: data });
}
