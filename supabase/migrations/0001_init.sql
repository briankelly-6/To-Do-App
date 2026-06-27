-- 0001_init.sql — schema for the personal to-do app.
--
-- v1 is single-user (every task is owned by BK), but the model is built so that
-- multi-user + read-only sharing can be turned on LATER without a data migration:
--   * every task carries an owner_id (the authenticated user who created it);
--   * access is governed by per-operation Row-Level Security policies.
-- To enable "any signed-in user can read everyone's tasks, but edit only their own",
-- change the SELECT policy's USING clause from (auth.uid() = owner_id) to (true).
-- The insert/update/delete policies already keep writes owner-only.

create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null check (char_length(trim(name)) > 0),
  priority     text not null default 'Medium'    check (priority in ('High', 'Medium', 'Low')),
  urgency      text not null default 'This week' check (urgency in ('Today', 'This week', 'Later')),
  category     text not null default 'Research'  check (category in ('Research', 'Personal', 'Firm')),
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- Supports owner-scoped reads and the default created_at ordering.
create index tasks_owner_created_idx on public.tasks (owner_id, created_at desc);

alter table public.tasks enable row level security;

-- Policies are intentionally split per-operation so future read-only sharing is a
-- one-line change (see header note) rather than a rewrite.

-- SELECT — v1: own tasks only.
-- FUTURE (read-only sharing): change `auth.uid() = owner_id` to `true`.
create policy "tasks_select_own"
  on public.tasks for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "tasks_update_own"
  on public.tasks for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = owner_id);
