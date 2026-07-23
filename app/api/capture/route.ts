import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";
import { classifyCapture } from "@/lib/classify";
import { getSettings } from "@/lib/settings";
import { routeCapture } from "@/lib/route-capture";

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

  const settings = await getSettings();
  const classification = await classifyCapture(text, settings.habits);
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
