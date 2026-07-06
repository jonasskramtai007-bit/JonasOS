-- Additive only: identity sentence on weekly reviews, habit-consistency
-- snapshot on completed goals, and the monthly_reviews scaffold for
-- future pattern analysis (no generation logic yet).

alter table public.weekly_reviews
  add column identity_sentence text;

-- rolling 7-day habit consistency (0..1) at the moment a goal was completed
alter table public.goals
  add column completion_consistency numeric;

create table public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  month date not null,
  patterns jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.monthly_reviews enable row level security;
