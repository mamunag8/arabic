-- Run in Supabase Studio (Arabic_DB) -> SQL Editor. Safe to re-run any
-- number of times -- every statement is idempotent (CREATE POLICY has no
-- IF NOT EXISTS in Postgres, so each one is preceded by a DROP IF EXISTS).

create table if not exists public.nd_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  done integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.nd_progress enable row level security;

drop policy if exists "read own progress" on public.nd_progress;
create policy "read own progress" on public.nd_progress
  for select using (auth.uid() = user_id);

drop policy if exists "insert own progress" on public.nd_progress;
create policy "insert own progress" on public.nd_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own progress" on public.nd_progress;
create policy "update own progress" on public.nd_progress
  for update using (auth.uid() = user_id);

-- Optional demographic details for edtech analysis and future planning.
-- Only name is enforced not-null; phone/email duplicate whatever the
-- student signed in with (readable independent of which one was used to
-- authenticate) but the app itself also requires at least one to be filled
-- before it will save.
create table if not exists public.nd_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  age integer,
  sex text,
  updated_at timestamptz not null default now()
);

alter table public.nd_profile enable row level security;

drop policy if exists "read own profile" on public.nd_profile;
create policy "read own profile" on public.nd_profile
  for select using (auth.uid() = user_id);

drop policy if exists "insert own profile" on public.nd_profile;
create policy "insert own profile" on public.nd_profile
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own profile" on public.nd_profile;
create policy "update own profile" on public.nd_profile
  for update using (auth.uid() = user_id);
