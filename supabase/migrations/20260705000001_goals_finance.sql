-- Phase 2: dedicated tables for goals and finance snapshots.
-- Same access model as the foundation: RLS enabled, no policies
-- (deny-all), all access via the service role.

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  text text not null,
  horizon text not null check (horizon in ('week', 'month')),
  done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per calendar month (use the first of the month).
create table public.finance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  month date not null,
  total numeric not null,
  income numeric,
  spend numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create index goals_user_horizon_idx on public.goals (user_id, horizon, done);
create index finance_snapshots_user_month_idx on public.finance_snapshots (user_id, month desc);

create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();
create trigger finance_snapshots_set_updated_at
  before update on public.finance_snapshots
  for each row execute function public.set_updated_at();

alter table public.goals enable row level security;
alter table public.finance_snapshots enable row level security;
