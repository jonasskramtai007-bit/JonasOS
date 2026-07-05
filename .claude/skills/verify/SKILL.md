---
name: verify
description: Build, launch and drive JonasOS to verify changes end-to-end.
---

# Verifying JonasOS

## Build & launch

```bash
npm run build
AUTH_SECRET=testsecret123 DASHBOARD_PASSWORD=hunter2 PORT=3100 npm run start
```

Auth env vars are required — middleware returns 500 without AUTH_SECRET.
Pages fetch from Supabase; without real credentials run the stub first:

```bash
node scripts/supabase-stub.mjs &    # in-memory PostgREST on :54321
node scripts/anthropic-stub.mjs &   # fake Claude Messages API on :54322
SUPABASE_URL=http://localhost:54321 SUPABASE_SERVICE_ROLE_KEY=stub \
  ANTHROPIC_API_KEY=stub ANTHROPIC_BASE_URL=http://localhost:54322 \
  AUTH_SECRET=testsecret123 DASHBOARD_PASSWORD=hunter2 PORT=3100 npm run start
```

Gotcha: `pkill -f "next-server"` from a Claude Bash call kills its own
shell (the pattern matches the wrapper). Launch servers with the
background-task tool and stop them with TaskStop instead.

Inspect stub state directly: `curl http://localhost:54321/rest/v1/<table>?select=*`.

## Flows worth driving

- Unauthenticated `GET /` → 307 to `/login`; tampered/missing cookie must never reach a page.
- `POST /api/auth/login` with `{"password":...}` → 200 sets `jonasos_session` cookie; wrong/malformed → 401.
- Any `/api/*` route accepts header `x-api-secret: $AUTH_SECRET` in place of the cookie.
- With the cookie: `/`, `/tasks`, `/journal`, `/goals`, `/finance`, `/review` all 200.
- `POST /api/auth/logout` clears the cookie.
- Capture pipeline: POST `/api/capture` with task/note/journal/goal-shaped
  text routes to the right table (anthropic stub classifies by keyword:
  "idea" → note, "felt" → journal, "this month I want" → goal, else task);
  without ANTHROPIC_API_KEY it returns `routed_to: null` and only the
  raw_captures row is written.
- Mutations: POST `/api/tasks` + PATCH/DELETE `/api/tasks/[id]`,
  PUT `/api/day` (journal/habits/today_will upsert), POST `/api/goals` +
  PATCH/DELETE `/api/goals/[id]`, PUT `/api/finance` (monthly upsert),
  PUT `/api/review` (409 once sealed). Each writes an `audit_log` row.
- UI flows: habit buttons on Home (ring updates, persists across reload),
  + NEW form on Tasks, SAVE ENTRY on Journal, add-goal inputs (Enter),
  ADD SNAPSHOT form on Finance, SEAL WEEK on Review (locks textareas).

## Browser

Playwright with the preinstalled Chromium:

```js
chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })
```

Login form field is `#password`, submit is `button[type=submit]`. Theme
toggle button in the top rail is labelled `LIGHT` (in dark mode) / `DARK`
(in light mode); Tasks page has `KANBAN` / `LIST` view buttons.

## Gotchas

- The repo dir name `JonasOS` has capitals — npm-name-sensitive tooling
  (create-next-app etc.) must run elsewhere and be copied in.
- Reference design lives in the original bundled HTML upload; extracted
  template markup is not committed.
