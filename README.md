# JonasOS

Personal dashboard. Next.js 15 (App Router, TypeScript strict), Tailwind CSS 4, Supabase, single-password auth. Tasks, journal, goals, habits, finance snapshots and weekly reviews are wired to the database, and the capture box auto-files thoughts with AI.

## Capture pipeline

`POST /api/capture` saves the raw text to `raw_captures` first (nothing is ever lost), then classifies it with Claude Haiku 4.5 (`lib/classify.ts`, structured outputs) and auto-files it as a **task**, **note**, **journal** entry (appended to today's log), or **goal**. The raw row records the classification and where it was routed. Without `ANTHROPIC_API_KEY` — or if classification fails — the capture stays in the inbox with `routed_to` null.

## Stack

- **UI** — components under `components/dashboard/`: a shared `Panel` wrapper, `TopRail` (6 tabs + theme toggle + clock), `Shell` layout, one component per card. Pages are server components reading via `lib/db.ts`; mutations go through `/api/*` routes (all audit-logged to `audit_log`).
- **Theme** — dark by default, light via the toggle in the top rail (persisted in `localStorage`). Colour tokens live in `app/globals.css` as oklch values: `ink-0`…`ink-4` neutrals, one `accent`, semantic `ok` / `warn` / `danger`.
- **Database** — Supabase project `khjafjvfpcuhwyljnbzf`. Schema in `supabase/migrations/`. RLS is enabled on every table with no policies (deny-all); all access goes through the service role via `lib/supabase/server.ts`.
- **Auth** — single password, HMAC-signed cookie (`lib/auth.ts`). `middleware.ts` gates every route except `/login` and `/api/auth/*`. API routes also accept an `x-api-secret` header equal to `AUTH_SECRET`.

## Setup

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Signs session cookies; also the accepted `x-api-secret` value. `openssl rand -hex 32` |
| `DASHBOARD_PASSWORD` | The password for `/login` |
| `SUPABASE_URL` | `https://khjafjvfpcuhwyljnbzf.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only — bypasses RLS) |
| `ANTHROPIC_API_KEY` | Optional — enables AI capture classification |

### Developing without Supabase credentials

`node scripts/supabase-stub.mjs` starts an in-memory PostgREST stand-in on port 54321; point the app at it with `SUPABASE_URL=http://localhost:54321 SUPABASE_SERVICE_ROLE_KEY=stub`. Similarly, `node scripts/anthropic-stub.mjs` fakes the Claude Messages API on port 54322 (keyword classifier); use `ANTHROPIC_API_KEY=stub ANTHROPIC_BASE_URL=http://localhost:54322`. Data is lost on restart — dev only.

## Tables

`raw_captures` (capture inbox) · `tasks` · `notes` · `daily_logs` (one row per day; `notes` jsonb holds journal text, habits and "today I will") · `goals` (week/month horizons) · `finance_snapshots` (one per month) · `weekly_reviews` · `audit_log`

Single-user: every row carries the fixed `user_id` from `lib/config.ts`, which also holds the profile, habit list and timezone.
