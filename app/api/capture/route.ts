import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";

/** Saves a raw capture. Classification/routing arrives in a later phase. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const source = typeof body?.source === "string" ? body.source : "web";

  const db = createServiceClient();
  const { data, error } = await db
    .from("raw_captures")
    .insert({ user_id: USER_ID, source, raw_text: text })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "capture.create", "raw_capture", data.id);
  return NextResponse.json({ capture: data });
}
