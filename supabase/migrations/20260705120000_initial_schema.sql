-- Initial schema: Ember MVP (Tier 1 education + Tier 2 challenge)
-- Approved 2026-07-05. The module_type enum includes all five tiers so no
-- migration is needed later, but only education/challenge get content tables.

-- ============================================================
-- Enums
-- ============================================================

create type public.module_type as enum (
  'education',
  'challenge',
  'movement',
  'program',
  'marketplace'
);

create type public.progress_status as enum (
  'not_started',
  'in_progress',
  'completed'
);
-- Note: "locked" is intentionally NOT a status. It's computed from module
-- order at read time, so reordering modules never corrupts user data.

-- ============================================================
-- Content tables (written via dashboard, read-only to the app)
-- ============================================================

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  order_index int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks (id) on delete cascade,
  type public.module_type not null,
  title text not null,
  summary text,
  order_index int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index modules_track_id_idx on public.modules (track_id, order_index);

create table public.education_content (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.modules (id) on delete cascade,
  body text not null,
  -- Rendered as a distinct "estimate, not a guarantee" callout in the UI.
  caveat text,
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  prompt text not null,
  choices jsonb not null,
  correct_index int not null check (correct_index >= 0),
  explanation text,
  order_index int not null default 0
);

create index quiz_questions_module_id_idx on public.quiz_questions (module_id, order_index);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.modules (id) on delete cascade,
  instructions text not null,
  -- The label on the daily check-in button, e.g. "Hit 100g protein".
  metric_label text not null,
  -- Consecutive daily check-ins required to complete (1 = same-day challenge).
  target_days int not null default 1 check (target_days >= 1)
);

-- ============================================================
-- Per-user tables
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- Global daily streak: any completed lesson or check-in keeps it alive.
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now()
);

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  status public.progress_status not null default 'in_progress',
  -- Consecutive check-in days on this challenge (0 for education modules).
  current_streak int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create index user_progress_user_id_idx on public.user_progress (user_id);

create table public.challenge_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  -- The user's local calendar day, supplied by the app.
  check_in_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, module_id, check_in_date)
);

create index challenge_check_ins_user_module_idx
  on public.challenge_check_ins (user_id, module_id, check_in_date desc);

-- ============================================================
-- Auto-create a profile row whenever a user signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for accounts created before this migration.
insert into public.profiles (id, display_name)
select id, raw_user_meta_data ->> 'display_name'
from auth.users
on conflict (id) do nothing;

-- Keep user_progress.updated_at accurate.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_progress_updated_at
  before update on public.user_progress
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
-- Content: logged-in users can read published content, never write it
-- (content editing happens in the Supabase dashboard, which bypasses RLS).
-- Personal data: users can only ever touch their own rows.

alter table public.tracks enable row level security;
alter table public.modules enable row level security;
alter table public.education_content enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.challenges enable row level security;
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.challenge_check_ins enable row level security;

create policy "Authenticated users can read published tracks"
  on public.tracks for select to authenticated
  using (is_published);

create policy "Authenticated users can read published modules"
  on public.modules for select to authenticated
  using (
    is_published
    and exists (
      select 1 from public.tracks t
      where t.id = track_id and t.is_published
    )
  );

create policy "Authenticated users can read lesson content"
  on public.education_content for select to authenticated
  using (
    exists (
      select 1 from public.modules m
      where m.id = module_id and m.is_published
    )
  );

create policy "Authenticated users can read quiz questions"
  on public.quiz_questions for select to authenticated
  using (
    exists (
      select 1 from public.modules m
      where m.id = module_id and m.is_published
    )
  );

create policy "Authenticated users can read challenges"
  on public.challenges for select to authenticated
  using (
    exists (
      select 1 from public.modules m
      where m.id = module_id and m.is_published
    )
  );

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users can read their own progress"
  on public.user_progress for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can create their own progress"
  on public.user_progress for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own progress"
  on public.user_progress for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can read their own check-ins"
  on public.challenge_check_ins for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can create their own check-ins"
  on public.challenge_check_ins for insert to authenticated
  with check (user_id = (select auth.uid()));
