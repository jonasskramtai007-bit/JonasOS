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
Supabase env vars are NOT needed to boot (no data fetching wired yet).

## Flows worth driving

- Unauthenticated `GET /` → 307 to `/login`; tampered/missing cookie must never reach a page.
- `POST /api/auth/login` with `{"password":...}` → 200 sets `jonasos_session` cookie; wrong/malformed → 401.
- Any `/api/*` route accepts header `x-api-secret: $AUTH_SECRET` in place of the cookie.
- With the cookie: `/`, `/tasks`, `/journal`, `/goals`, `/finance`, `/review` all 200.
- `POST /api/auth/logout` clears the cookie.

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
