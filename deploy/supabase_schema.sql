-- Run once in Supabase Studio (Arabic_DB) -> SQL Editor, before the login
-- feature goes live. One table: each student's device-progress array,
-- readable/writable only by that student.

create table if not exists public.nd_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  done integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.nd_progress enable row level security;

create policy "read own progress" on public.nd_progress
  for select using (auth.uid() = user_id);

create policy "insert own progress" on public.nd_progress
  for insert with check (auth.uid() = user_id);

create policy "update own progress" on public.nd_progress
  for update using (auth.uid() = user_id);
