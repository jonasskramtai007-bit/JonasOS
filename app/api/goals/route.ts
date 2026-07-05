import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const horizon = body?.horizon === "month" ? "month" : "week";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("goals")
    .insert({ user_id: USER_ID, text, horizon })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "goal.create", "goal", data.id, { horizon });
  return NextResponse.json({ goal: data });
}
