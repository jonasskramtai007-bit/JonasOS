import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";

const URGENCIES = ["today", "week", "month", "someday"];

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (typeof body.description === "string") patch.description = body.description;
  if (URGENCIES.includes(body.urgency)) patch.urgency = body.urgency;
  if (typeof body.key === "boolean") patch.key = body.key;
  if (typeof body.category === "string") patch.category = body.category || null;
  if (typeof body.completed === "boolean") {
    patch.completed_at = body.completed ? new Date().toISOString() : null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", USER_ID)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });

  await audit(db, "task.update", "task", id, patch);
  return NextResponse.json({ task: data });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const db = createServiceClient();
  const { error } = await db
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", USER_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "task.delete", "task", id);
  return NextResponse.json({ ok: true });
}
