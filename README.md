# To-Do

A simple, single-user personal to-do app. Built for clarity and low maintenance:
React + TypeScript + Vite, Tailwind CSS, Supabase (database + magic-link auth + sync),
deployed on Vercel.

## Features

- **Magic-link sign-in** (passwordless). The session is stored and auto-refreshed,
  so you stay signed in across browser restarts — one login per device.
- **Add / edit tasks** in a pop-up modal. Name is required; priority, urgency, and
  category are fixed dropdowns pre-filled with sensible defaults.
- **Quick-add**: the add modal stays open after saving (name cleared, focus returned)
  so you can type a name, press **Enter**, and keep going.
- **Complete** toggles a **red strike-through**; the task stays in place (it is not
  deleted) until it is auto-removed.
- **Auto-remove**: completed tasks are permanently deleted **7 days** after completion.
- **Sort** by urgency (default), priority, or category, and **filter** by any of the three.

### A task has exactly these fields

| Field          | Type / values                              | Notes                                  |
| -------------- | ------------------------------------------ | -------------------------------------- |
| `name`         | text (required)                            |                                        |
| `priority`     | `High` / `Medium` / `Low`                  | default `Medium`                       |
| `urgency`      | `Today` / `This week` / `Later`            | default `This week`                    |
| `category`     | `Research` / `Personal` / `Firm`           | default `Research`                     |
| `completed`    | boolean                                    |                                        |
| `completed_at` | timestamp                                  | set when completed, cleared when undone |
| `owner_id`     | the signing-in user                        | enables future multi-user (see below)  |
| `id`, `created_at` | standard                               |                                        |

Default ordering is by urgency (Today → This week → Later), then priority
(High → Medium → Low), with newest first as a tiebreak.

## Architecture

- **All task reads/writes go through one module: `src/data/tasks.ts`.** Components
  never call Supabase directly. This isolation keeps things clean and means offline
  support (or multi-user scopes) can be added later without touching the UI.
- **Pure, tested logic** lives in `src/logic/` — `sort.ts`, `filter.ts`, and
  `cleanup.ts` (the 7-day rule). These are plain functions with unit tests.
- **The 7-day auto-removal is "cleanup-on-load"**: on each app load the data layer
  deletes completed tasks older than 7 days (`purgeExpired` in `src/data/tasks.ts`,
  using the cutoff from `src/logic/cleanup.ts`). No cron jobs or edge functions.
- **Single Supabase client** in `src/lib/supabase.ts`, configured for a persistent,
  auto-refreshing session.

```
src/
  lib/supabase.ts     single Supabase client
  data/types.ts       Task type + the three fixed option sets + defaults
  data/tasks.ts       the only place task queries live
  logic/              pure sort / filter / cleanup (+ unit tests)
  hooks/              useAuth, useTasks
  components/         Login, TaskApp, Controls, TaskList, TaskRow, TaskModal
supabase/migrations/  database schema (table + RLS policies)
```

## Setup

### 1. Create the Supabase project

1. Create a project at <https://supabase.com> (free tier is fine).
2. In the dashboard, open **SQL Editor** and run the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This
   creates the `tasks` table, indexes, and Row-Level Security policies.
3. (Recommended for a single-user app) Under **Authentication → Providers → Email**,
   keep magic links enabled, and to lock the app to just you, **disable public
   sign-ups** ("Allow new users to sign up") after your first login — or restrict
   sign-ups to your address. Row-Level Security already prevents anyone from seeing
   anyone else's tasks regardless.

### 2. Configure local environment

```bash
cp .env.example .env.local
```

Fill in the two values from **Project Settings → API**:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

Both are safe to expose in the browser — the anon key only permits what RLS allows.

### 3. Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Add `http://localhost:5173` to **Authentication → URL Configuration → Redirect URLs**
in Supabase so the magic link returns you to the local app.

## Scripts

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Start the dev server                           |
| `npm run build`    | Type-check and build for production (`dist/`)  |
| `npm run preview`  | Preview the production build locally           |
| `npm run test`     | Run the unit tests (sort / filter / cleanup)   |

## Deploy to Vercel

1. Push this repo to GitHub and import it at <https://vercel.com>. Framework preset:
   **Vite** (build `npm run build`, output `dist`).
2. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   in **Project → Settings → Environment Variables**.
3. After the first deploy, copy the production URL and add it to Supabase
   **Authentication → URL Configuration**: set it as the **Site URL** and add it to
   **Redirect URLs** so magic links work on the live site.

## Notes

- **VDI / wiped browser storage**: the persistent session lives in the browser. If a
  device wipes its storage between sessions you'll get a fresh magic link on each
  reconnect — that's an environment limitation, not a bug.
- **Future multi-user / read-only sharing**: every task already has an `owner_id`, and
  the RLS policies are split per operation. To let any signed-in user read everyone's
  tasks (while still only editing their own), change the `SELECT` policy's `USING`
  clause from `auth.uid() = owner_id` to `true` — see the note at the top of the
  migration. No data migration required.
