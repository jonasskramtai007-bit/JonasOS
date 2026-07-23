// Server-only settings, stored as key/value jsonb rows in
// app_settings and falling back to the constants in config.ts.

import { createServiceClient } from "./supabase/server";
import { USER_ID, PROFILE, HABITS } from "./config";

export interface Settings {
  name: string;
  role: string;
  focus: string;
  habits: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  name: PROFILE.name,
  role: PROFILE.role,
  focus: PROFILE.focus,
  habits: HABITS,
};

export async function getSettings(): Promise<Settings> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("app_settings")
    .select("key, value")
    .eq("user_id", USER_ID);
  if (error) {
    console.error("settings read failed:", error.message);
    return DEFAULT_SETTINGS;
  }
  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  const profile = (byKey.get("profile") ?? {}) as Partial<Settings>;
  const habits = byKey.get("habits");
  return {
    name: typeof profile.name === "string" && profile.name ? profile.name : DEFAULT_SETTINGS.name,
    role: typeof profile.role === "string" && profile.role ? profile.role : DEFAULT_SETTINGS.role,
    focus: typeof profile.focus === "string" ? profile.focus : DEFAULT_SETTINGS.focus,
    habits:
      Array.isArray(habits) && habits.length > 0
        ? habits.filter((h): h is string => typeof h === "string")
        : DEFAULT_SETTINGS.habits,
  };
}

export async function saveSetting(key: "profile" | "habits", value: unknown) {
  const db = createServiceClient();
  const { error } = await db
    .from("app_settings")
    .upsert({ user_id: USER_ID, key, value }, { onConflict: "user_id,key" });
  if (error) throw new Error(error.message);
}
