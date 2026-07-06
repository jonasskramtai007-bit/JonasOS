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

## Daily prompt & weekly review AI

- **Daily prompt** — a Vercel cron (`vercel.json`, 18:00 UTC ≈ 21:00 Vilnius) hits `/api/cron/daily-prompt` with `Authorization: Bearer ${CRON_SECRET}`. The route summarizes open tasks, habit state, and journal status, writes a 3–4 line check-in with Haiku (honest, no filler positivity), and emails it via Resend to `NOTIFY_EMAIL`. Idempotent per day; `?force=1` bypasses the guards. If `PROMPT_HOUR` is set the route also skips unless the current hour in `USER_TIMEZONE` matches (the cron schedule itself is fixed UTC — Vercel can't read env vars there).
- **Weekly review** — first visit of the week auto-generates an editable draft (wins / slipped / open loops) from the week's actual tasks, habits, and journal. On SEAL, a one-time *identity sentence* is generated: who you were being this week, evidenced by the data.
- **Habit consistency** — rolling 7-day and 30-day completion rates are computed from `daily_logs` (`lib/habits.ts`) and shown on the Operator and Habits cards, with a 30-day sparkline. Completing a goal snapshots the current 7-day rate into `goals.completion_consistency` for future monthly analysis (`monthly_reviews` table is scaffolded, no logic yet).

| Variable | Purpose |
| --- | --- |
| `CRON_SECRET` | Bearer token for cron endpoints (Vercel sends it automatically) |
| `RESEND_API_KEY` / `NOTIFY_EMAIL` | Daily prompt email delivery |
| `USER_TIMEZONE` / `PROMPT_HOUR` | Optional local-hour gate for the prompt |

## Tables

`raw_captures` (capture inbox) · `tasks` · `notes` · `daily_logs` (one row per day; `notes` jsonb holds journal text, habits and "today I will") · `goals` (week/month horizons) · `finance_snapshots` (one per month) · `weekly_reviews` (incl. `identity_sentence`) · `monthly_reviews` (pattern-analysis scaffold) · `audit_log`

Single-user: every row carries the fixed `user_id` from `lib/config.ts`, which also holds the profile, habit list and timezone.
