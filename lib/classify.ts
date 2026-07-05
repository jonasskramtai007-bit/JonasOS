// Server-only capture classification via Claude Haiku 4.5.
// Returns null when no API key is configured or classification fails —
// the capture then simply stays in the inbox, nothing is lost.

import Anthropic from "@anthropic-ai/sdk";
import { HABITS, TIMEZONE } from "./config";
import type { GoalHorizon, Mood, Urgency } from "./types";

export interface Classification {
  route: "task" | "note" | "journal" | "goal";
  title: string;
  body: string;
  urgency: Urgency;
  category: string | null;
  tags: string[];
  horizon: GoalHorizon;
  mood: Mood | null;
}

const ROUTES = ["task", "note", "journal", "goal"];
const URGENCIES = ["today", "week", "month", "someday"];
const MOODS = ["low", "flat", "good"];

const SCHEMA = {
  type: "object",
  properties: {
    route: {
      type: "string",
      enum: ROUTES,
      description: "Where this capture belongs",
    },
    title: {
      type: "string",
      description: "Short imperative title (tasks/notes/goals), max ~8 words",
    },
    body: {
      type: "string",
      description: "The cleaned-up capture text",
    },
    urgency: {
      type: "string",
      enum: URGENCIES,
      description: "For tasks: when it needs to happen",
    },
    category: {
      anyOf: [{ type: "string" }, { type: "null" }],
      description: "One lowercase word, e.g. health, finance, study; null if unclear",
    },
    tags: { type: "array", items: { type: "string" } },
    horizon: {
      type: "string",
      enum: ["week", "month"],
      description: "For goals: the timeframe",
    },
    mood: {
      anyOf: [{ type: "string", enum: MOODS }, { type: "null" }],
      description: "For journal entries: the mood expressed, if any",
    },
  },
  required: ["route", "title", "body", "urgency", "category", "tags", "horizon", "mood"],
  additionalProperties: false,
} as const;

function systemPrompt(): string {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  });
  return `You classify short captured thoughts for JonasOS, a personal dashboard. Today is ${today}.

Routes:
- task: something actionable to do ("buy milk", "email the landlord tomorrow")
- goal: an aspirational outcome for this week or month ("run 20km this month", "save €200")
- journal: a reflection, feeling, or diary-style observation ("felt great after the run")
- note: an idea, insight, or reference worth keeping that isn't actionable ("idea: sync dashboard with calendar")

Rules:
- Choose exactly one route.
- title: short and imperative for tasks/goals, descriptive for notes. For journal entries reuse the first few words.
- body: the capture text lightly cleaned (fix casing, drop filler like "remember to").
- urgency (tasks only): "today" if it must happen today or has words like tonight/asap, "week" for this week or unspecified deadlines, "month" for later this month, "someday" for no time pressure. Use "week" when not a task.
- horizon (goals only): "week" unless the text clearly spans a month. Use "week" when not a goal.
- category: one lowercase word (health, finance, study, admin, project, social...) or null.
- mood (journal only): low, flat, or good if the text expresses one; otherwise null. The user's daily habits are ${HABITS.join(", ")} — journal mentions of doing them are still journal entries.`;
}

/** Classify a capture. Returns null if unconfigured or anything fails. */
export async function classifyCapture(
  text: string,
): Promise<Classification | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt(),
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: text }],
    });
    if (response.stop_reason === "refusal") return null;
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    const parsed = JSON.parse(block.text);
    if (!ROUTES.includes(parsed.route)) return null;
    return {
      route: parsed.route,
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : text.slice(0, 80),
      body: typeof parsed.body === "string" && parsed.body.trim() ? parsed.body.trim() : text,
      urgency: URGENCIES.includes(parsed.urgency) ? parsed.urgency : "week",
      category: typeof parsed.category === "string" ? parsed.category : null,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((t: unknown): t is string => typeof t === "string")
        : [],
      horizon: parsed.horizon === "month" ? "month" : "week",
      mood: MOODS.includes(parsed.mood) ? parsed.mood : null,
    };
  } catch (error) {
    console.error("capture classification failed:", error);
    return null;
  }
}
