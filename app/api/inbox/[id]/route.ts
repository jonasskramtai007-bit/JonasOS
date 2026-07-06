import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";
import { manualClassification, routeCapture } from "@/lib/route-capture";

type Params = { params: Promise<{ id: string }> };

const ROUTES = ["task", "note", "journal", "goal"] as const;

/** Manually route an inbox capture to a destination. */
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const route = ROUTES.find((r) => r === body?.route);
  if (!route) {
    return NextResponse.json(
      { error: "route must be one of task, note, journal, goal" },
      { status: 400 },
    );
  }

  const db = createServiceClient();
  const { data: capture, error } = await db
    .from("raw_captures")
    .select("id, raw_text, routed_id")
    .eq("id", id)
    .eq("user_id", USER_ID)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!capture) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (capture.routed_id) {
    return NextResponse.json({ error: "already routed" }, { status: 409 });
  }

  const classification = manualClassification(capture.raw_text, route);
  let routedId: string | null;
  try {
    routedId = await routeCapture(db, classification);
  } catch (routeError) {
    return NextResponse.json(
      { error: routeError instanceof Error ? routeError.message : "routing failed" },
      { status: 500 },
    );
  }

  const { data: updated, error: updateError } = await db
    .from("raw_captures")
    .update({
      classification: { ...classification, manual: true },
      routed_to: route,
      routed_id: routedId,
    })
    .eq("id", id)
    .select()
    .single();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await audit(db, "capture.route.manual", "raw_capture", id, {
    routed_to: route,
    routed_id: routedId,
  });
  return NextResponse.json({ capture: updated, routed_to: route, routed_id: routedId });
}

/** Discard an inbox capture. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const db = createServiceClient();
  const { error } = await db
    .from("raw_captures")
    .delete()
    .eq("id", id)
    .eq("user_id", USER_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "capture.delete", "raw_capture", id);
  return NextResponse.json({ ok: true });
}
