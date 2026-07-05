// Minimal Anthropic Messages API stand-in for local development,
// so the capture pipeline can be exercised without an API key.
// Keyword-based classification, same JSON shape the real model returns.
//
//   node scripts/anthropic-stub.mjs   # port 54322
//   ANTHROPIC_API_KEY=stub ANTHROPIC_BASE_URL=http://localhost:54322 npm run dev
//
// NOT for production.

import { createServer } from "node:http";

const PORT = Number(process.env.ANTHROPIC_STUB_PORT ?? 54322);

function classify(text) {
  const t = text.toLowerCase();
  const c = {
    route: "task",
    title: text.slice(0, 60),
    body: text,
    urgency: "week",
    category: null,
    tags: [],
    horizon: "week",
    mood: null,
  };
  if (/\b(idea|note to self|remember that|insight)\b/.test(t)) {
    c.route = "note";
  } else if (/\b(felt|feeling|grateful|tired|happy|sad|proud|today was)\b/.test(t)) {
    c.route = "journal";
    c.mood = /\b(tired|sad|awful|bad)\b/.test(t) ? "low" : "good";
  } else if (/\b(goal|i want to|this month|this week i will|save €|save \$)\b/.test(t)) {
    c.route = "goal";
    c.horizon = /month/.test(t) ? "month" : "week";
  } else if (/\b(today|tonight|asap|now)\b/.test(t)) {
    c.urgency = "today";
  }
  return c;
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || !req.url.startsWith("/v1/messages")) {
    res.writeHead(404, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "not found" }));
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString());
  const text = body.messages?.[0]?.content ?? "";
  const result = classify(typeof text === "string" ? text : "");
  console.log(`[anthropic-stub] "${String(text).slice(0, 40)}" -> ${result.route}`);
  res.writeHead(200, { "content-type": "application/json" });
  res.end(
    JSON.stringify({
      id: "msg_stub",
      type: "message",
      role: "assistant",
      model: body.model,
      content: [{ type: "text", text: JSON.stringify(result) }],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 50 },
    }),
  );
});

server.listen(PORT, () => {
  console.log(`[anthropic-stub] Messages API stub on http://localhost:${PORT}`);
});
