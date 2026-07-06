// Minimal in-memory PostgREST stand-in for local development,
// covering only the query shapes JonasOS uses (eq / is.null filters,
// order, limit, insert, update, delete, upsert with on_conflict).
//
//   node scripts/supabase-stub.mjs            # port 54321
//   SUPABASE_URL=http://localhost:54321 SUPABASE_SERVICE_ROLE_KEY=stub npm run dev
//
// NOT for production — no auth, no RLS, data lives in memory.

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.STUB_PORT ?? 54321);
const tables = new Map(); // name -> row[]

function rows(table) {
  if (!tables.has(table)) tables.set(table, []);
  return tables.get(table);
}

function parseFilters(searchParams) {
  const filters = [];
  for (const [key, value] of searchParams) {
    if (["select", "order", "limit", "offset", "on_conflict"].includes(key)) continue;
    const [op, ...rest] = value.split(".");
    const operand = rest.join(".");
    if (op === "eq") filters.push((row) => String(row[key]) === operand);
    else if (op === "is" && operand === "null") filters.push((row) => row[key] === null || row[key] === undefined);
    else if (op === "not" && operand === "is.null") filters.push((row) => row[key] !== null && row[key] !== undefined);
    else if (op === "gte") filters.push((row) => String(row[key] ?? "") >= operand);
    else if (op === "lte") filters.push((row) => String(row[key] ?? "") <= operand);
    else filters.push(() => false); // unsupported filter: match nothing loudly
  }
  return filters;
}

function applyQuery(list, searchParams) {
  const filters = parseFilters(searchParams);
  let out = list.filter((row) => filters.every((f) => f(row)));
  const order = searchParams.get("order");
  if (order) {
    const [col, dir] = order.split(".");
    out = [...out].sort((a, b) => {
      const av = a[col] ?? "";
      const bv = b[col] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "desc" ? -cmp : cmp;
    });
  }
  const limit = searchParams.get("limit");
  if (limit) out = out.slice(0, Number(limit));
  return out;
}

function respond(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function representation(res, accept, list) {
  if (accept.includes("vnd.pgrst.object")) {
    if (list.length !== 1) {
      return respond(res, 406, {
        code: "PGRST116",
        message: "JSON object requested, multiple (or no) rows returned",
        details: `Results contain ${list.length} rows`,
        hint: null,
      });
    }
    return respond(res, 200, list[0]);
  }
  respond(res, 200, list);
}

function newRow(table, input) {
  const now = new Date().toISOString();
  const row = { id: randomUUID(), created_at: now, ...input };
  if (["tasks", "notes", "daily_logs", "weekly_reviews", "goals", "finance_snapshots"].includes(table)) {
    row.updated_at = now;
  }
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined) row[key] = null;
  }
  return row;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const match = url.pathname.match(/^\/rest\/v1\/([a-z_]+)$/);
  if (!match) return respond(res, 404, { message: "not found" });
  const table = match[1];
  const accept = req.headers.accept ?? "";
  const prefer = req.headers.prefer ?? "";

  let body = null;
  if (req.method === "POST" || req.method === "PATCH") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString() || "null");
  }

  if (req.method === "GET") {
    return representation(res, accept, applyQuery(rows(table), url.searchParams));
  }

  if (req.method === "POST") {
    const inputs = Array.isArray(body) ? body : [body];
    const conflictCols = (url.searchParams.get("on_conflict") ?? "").split(",").filter(Boolean);
    const merge = prefer.includes("resolution=merge-duplicates") && conflictCols.length > 0;
    const out = [];
    for (const input of inputs) {
      const existing = merge
        ? rows(table).find((row) => conflictCols.every((c) => String(row[c]) === String(input[c])))
        : undefined;
      if (existing) {
        Object.assign(existing, input, { updated_at: new Date().toISOString() });
        out.push(existing);
      } else {
        const row = newRow(table, input);
        rows(table).push(row);
        out.push(row);
      }
    }
    console.log(`[stub] ${merge ? "upsert" : "insert"} ${table}`, out.map((r) => r.id).join(","));
    return representation(res, accept, out);
  }

  if (req.method === "PATCH") {
    const matched = applyQuery(rows(table), url.searchParams);
    for (const row of matched) {
      Object.assign(row, body, { updated_at: new Date().toISOString() });
    }
    console.log(`[stub] update ${table} (${matched.length})`);
    return representation(res, accept, matched);
  }

  if (req.method === "DELETE") {
    const matched = new Set(applyQuery(rows(table), url.searchParams));
    tables.set(table, rows(table).filter((row) => !matched.has(row)));
    console.log(`[stub] delete ${table} (${matched.size})`);
    return representation(res, accept, [...matched]);
  }

  respond(res, 405, { message: "method not allowed" });
});

server.listen(PORT, () => {
  console.log(`[stub] Supabase REST stub on http://localhost:${PORT} (in-memory)`);
});
