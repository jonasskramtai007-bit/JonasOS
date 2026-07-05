# JonasOS

Personal dashboard. Next.js 15 (App Router, TypeScript strict), Tailwind CSS 4, Supabase, single-password auth. Tasks, journal, goals, habits, finance snapshots and weekly reviews are wired to the database; AI capture routing comes later (captures are saved raw to `raw_captures`).

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

### Developing without Supabase credentials

`node scripts/supabase-stub.mjs` starts an in-memory PostgREST stand-in on port 54321; point the app at it with `SUPABASE_URL=http://localhost:54321 SUPABASE_SERVICE_ROLE_KEY=stub`. Data is lost on restart — dev only.

## Tables

`raw_captures` (capture inbox) · `tasks` · `notes` · `daily_logs` (one row per day; `notes` jsonb holds journal text, habits and "today I will") · `goals` (week/month horizons) · `finance_snapshots` (one per month) · `weekly_reviews` · `audit_log`

Single-user: every row carries the fixed `user_id` from `lib/config.ts`, which also holds the profile, habit list and timezone.
