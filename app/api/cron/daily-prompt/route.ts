import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { USER_ID, TIMEZONE } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import { localDateISO } from "@/lib/dates";
import { getDailyLog, listRecentLogs, listTodayTasks } from "@/lib/db";
import { habitStats, pct } from "@/lib/habits";
import { haikuText } from "@/lib/haiku";
import { sendEmail } from "@/lib/email";
import { audit } from "@/lib/audit";
import { timingSafeEqual } from "@/lib/auth";

/**
 * Daily evening prompt. Triggered by Vercel cron (see vercel.json);
 * authenticated with `Authorization: Bearer ${CRON_SECRET}` — this
 * path is excluded from the session middleware.
 *
 * The vercel.json schedule is fixed UTC. If PROMPT_HOUR is set, the
 * route additionally skips unless the current hour in USER_TIMEZONE
 * matches — useful when the cron fires more often than once a day.
 * Pass ?force=1 to bypass both the hour gate and the once-a-day guard.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  const header = request.headers.get("authorization") ?? "";
  if (!timingSafeEqual(header, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "1";
  const promptHour = Number(process.env.PROMPT_HOUR);
  if (!force && Number.isInteger(promptHour)) {
    const hourNow = Number(
      new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        hour12: false,
        timeZone: TIMEZONE,
      }).format(new Date()),
    );
    if (hourNow !== promptHour) {
      return NextResponse.json({ skipped: "outside PROMPT_HOUR", hourNow });
    }
  }

  const today = localDateISO();
  const todayLog = await getDailyLog(today);
  if (!force && todayLog?.notes?.prompt_sent) {
    return NextResponse.json({ skipped: "already sent today" });
  }

  const [openTasks, recentLogs, settings] = await Promise.all([
    listTodayTasks(),
    listRecentLogs(40),
    getSettings(),
  ]);
  const HABITS = settings.habits;
  const habitsDone = todayLog?.notes?.habits ?? [];
  const habitsMissing = HABITS.filter((h) => !habitsDone.includes(h));
  const journalDone = !!todayLog?.notes?.journal;
  const stats = habitStats(recentLogs, HABITS.length, today);

  const dataSummary = [
    `Open key/today tasks (${openTasks.length}): ${openTasks.map((t) => t.title).join("; ") || "none"}`,
    `Habits done today: ${habitsDone.join(", ") || "none"} (${habitsDone.length}/${HABITS.length}). Missing: ${habitsMissing.join(", ") || "none"}`,
    `7-day habit consistency: ${pct(stats.rate7)}`,
    `Journal entry today: ${journalDone ? "yes" : "not yet"}`,
  ].join("\n");

  const message =
    (await haikuText(
      `You write a 3-4 line evening check-in for a personal dashboard. Rules: state plainly what is still open today; if habits are behind, give ONE specific nudge naming the easiest missing habit; encouragement only if the data genuinely earns it (e.g. everything done, or consistency clearly up) — otherwise none. No greetings, no sign-off, no exclamation marks, no generic positivity.`,
      dataSummary,
      300,
    )) ??
    // deterministic fallback when no AI key is configured
    [
      openTasks.length
        ? `Still open: ${openTasks.map((t) => t.title).join("; ")}.`
        : "No open tasks for today.",
      habitsMissing.length
        ? `Habits missing: ${habitsMissing.join(", ")}.`
        : "All habits done.",
      journalDone ? "" : "No journal entry yet.",
    ]
      .filter(Boolean)
      .join("\n");

  const sent = await sendEmail(`JonasOS · ${today}`, message);

  // mark as sent so a re-run the same day is a no-op
  const db = createServiceClient();
  await db.from("daily_logs").upsert(
    {
      user_id: USER_ID,
      log_date: today,
      notes: { ...(todayLog?.notes ?? {}), prompt_sent: true },
      mood: todayLog?.mood ?? null,
    },
    { onConflict: "user_id,log_date" },
  );
  await audit(db, "prompt.daily", "daily_log", todayLog?.id ?? null, { sent });

  return NextResponse.json({ sent, message });
}
