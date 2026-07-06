// Small server-only helpers for cheap Claude Haiku calls.
// Both return null when ANTHROPIC_API_KEY is unset or the call fails,
// so callers degrade gracefully.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5";

export async function haikuText(
  system: string,
  user: string,
  maxTokens = 512,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });
    if (response.stop_reason === "refusal") return null;
    const block = response.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text.trim() : null;
  } catch (error) {
    console.error("haiku text call failed:", error);
    return null;
  }
}

export async function haikuJSON<T>(
  system: string,
  user: string,
  schema: Record<string, unknown>,
  maxTokens = 1024,
): Promise<T | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      output_config: { format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: user }],
    });
    if (response.stop_reason === "refusal") return null;
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    return JSON.parse(block.text) as T;
  } catch (error) {
    console.error("haiku json call failed:", error);
    return null;
  }
}
