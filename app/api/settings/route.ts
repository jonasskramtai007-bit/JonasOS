import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { saveSetting } from "@/lib/settings";
import { audit } from "@/lib/audit";

const MAX_HABITS = 9;

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    if (body.profile && typeof body.profile === "object") {
      const { name, role, focus } = body.profile;
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "name is required" }, { status: 400 });
      }
      await saveSetting("profile", {
        name: name.trim(),
        role: typeof role === "string" ? role.trim() : "",
        focus: typeof focus === "string" ? focus.trim() : "",
      });
    }

    if (body.habits !== undefined) {
      if (!Array.isArray(body.habits)) {
        return NextResponse.json({ error: "habits must be an array" }, { status: 400 });
      }
      const habits = [
        ...new Set(
          body.habits
            .filter((h: unknown): h is string => typeof h === "string")
            .map((h: string) => h.trim().toUpperCase().slice(0, 12))
            .filter(Boolean),
        ),
      ].slice(0, MAX_HABITS);
      if (habits.length === 0) {
        return NextResponse.json({ error: "at least one habit required" }, { status: 400 });
      }
      await saveSetting("habits", habits);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "save failed" },
      { status: 500 },
    );
  }

  await audit(createServiceClient(), "settings.update", "app_settings", null);
  return NextResponse.json({ ok: true });
}
