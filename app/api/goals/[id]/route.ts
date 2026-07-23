import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";
import { listRecentLogs } from "@/lib/db";
import { consistencyRate } from "@/lib/habits";
import { getSettings } from "@/lib/settings";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const patch: Record<string, unknown> = {};
  if (typeof body?.text === "string" && body.text.trim()) patch.text = body.text.trim();
  if (typeof body?.done === "boolean") {
    patch.done = body.done;
    patch.completed_at = body.done ? new Date().toISOString() : null;
    // data collection for future monthly analysis: snapshot the
    // rolling 7-day habit consistency alongside the completion
    if (body.done) {
      const [logs, settings] = await Promise.all([listRecentLogs(10), getSettings()]);
      patch.completion_consistency = Number(
        consistencyRate(logs, 7, settings.habits.length).toFixed(3),
      );
    } else {
      patch.completion_consistency = null;
    }
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("goals")
    .update(patch)
    .eq("id", id)
    .eq("user_id", USER_ID)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });

  await audit(db, "goal.update", "goal", id, patch);
  return NextResponse.json({ goal: data });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const db = createServiceClient();
  const { error } = await db
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", USER_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "goal.delete", "goal", id);
  return NextResponse.json({ ok: true });
}
