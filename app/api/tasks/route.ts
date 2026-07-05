import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { audit } from "@/lib/audit";

const URGENCIES = ["today", "week", "month", "someday"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const urgency = URGENCIES.includes(body?.urgency) ? body.urgency : "week";

  const db = createServiceClient();
  const { data, error } = await db
    .from("tasks")
    .insert({
      user_id: USER_ID,
      title,
      urgency,
      key: body?.key === true,
      description: typeof body?.description === "string" ? body.description : null,
      category: typeof body?.category === "string" && body.category.trim()
        ? body.category.trim()
        : null,
      tags: Array.isArray(body?.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [],
      due_date: typeof body?.due_date === "string" ? body.due_date : null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(db, "task.create", "task", data.id, { title });
  return NextResponse.json({ task: data });
}
