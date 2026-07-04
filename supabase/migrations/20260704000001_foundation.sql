-- JonasOS foundation schema
-- All access goes through the service role (which bypasses RLS).
-- RLS is enabled on every table with no policies, which denies all
-- access via the anon / authenticated API keys.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Inbox for everything captured before it is classified and routed.
create table public.raw_captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source text not null default 'web',
  raw_text text not null,
  classification jsonb,
  routed_to text,
  routed_id uuid,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  urgency text not null default 'week'
    check (urgency in ('today', 'week', 'month', 'someday')),
  key boolean not null default false,
  priority_score numeric,
  tags text[] not null default '{}',
  category text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  body text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per day; notes jsonb holds habits / finance / goals state.
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  log_date date not null,
  notes jsonb not null default '{}',
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  week_start date not null,
  wins text,
  slipped text,
  open_loops text,
  next_week_top3 text,
  sealed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index raw_captures_user_created_idx on public.raw_captures (user_id, created_at desc);
create index tasks_user_urgency_idx on public.tasks (user_id, urgency);
create index tasks_user_due_idx on public.tasks (user_id, due_date);
create index notes_user_created_idx on public.notes (user_id, created_at desc);
create index audit_log_user_created_idx on public.audit_log (user_id, created_at desc);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();
create trigger daily_logs_set_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();
create trigger weekly_reviews_set_updated_at
  before update on public.weekly_reviews
  for each row execute function public.set_updated_at();

-- Deny-all: RLS on, no policies. The service role bypasses RLS.
alter table public.raw_captures enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.daily_logs enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.audit_log enable row level security;
