create extension if not exists pgcrypto;

create table if not exists public.hunters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text,
  class text,
  mark text,
  title text,
  status text,
  model text,
  load text,
  success_rate numeric(5,2),
  avg_tokens integer,
  spend_band text,
  grade text,
  champion boolean not null default false,
  ready_upgrade boolean not null default false,
  is_full boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  meta text,
  badge text,
  badge_type text,
  status text not null,
  status_key text,
  tier_key text,
  tier_class text,
  summary text,
  description text,
  latest_progress text,
  published_at_label text,
  updated_at_label text,
  current_issue text,
  done_when text,
  hunter_label text,
  deadline_label text,
  tokens_label text,
  reward_label text,
  risk text,
  risk_level text,
  task_type text,
  focus boolean not null default false,
  needs_action boolean not null default false,
  high_cost boolean not null default false,
  deadline_risk boolean not null default false,
  progress integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  happened_at_label text,
  title text not null,
  text text,
  level text,
  created_at timestamptz not null default now()
);

create table if not exists public.task_actions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_kpis (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  note text,
  variant text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_models (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tokens text,
  cost text,
  percent numeric(8,2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meta text,
  critical boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  happened_at_label text,
  title text not null,
  text text,
  level text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.dashboard_kpis (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  unit text,
  variant text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_hunters_updated_at on public.hunters;
create trigger set_hunters_updated_at
before update on public.hunters
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.hunters enable row level security;
alter table public.tasks enable row level security;
alter table public.task_logs enable row level security;
alter table public.task_actions enable row level security;
alter table public.resource_kpis enable row level security;
alter table public.resource_models enable row level security;
alter table public.resource_alerts enable row level security;
alter table public.timeline_events enable row level security;
alter table public.dashboard_kpis enable row level security;

create policy "public read hunters" on public.hunters for select using (true);
create policy "public insert hunters" on public.hunters for insert with check (true);
create policy "public update hunters" on public.hunters for update using (true) with check (true);

create policy "public read tasks" on public.tasks for select using (true);
create policy "public insert tasks" on public.tasks for insert with check (true);
create policy "public update tasks" on public.tasks for update using (true) with check (true);

create policy "public read task_logs" on public.task_logs for select using (true);
create policy "public insert task_logs" on public.task_logs for insert with check (true);

create policy "public read task_actions" on public.task_actions for select using (true);
create policy "public insert task_actions" on public.task_actions for insert with check (true);

create policy "public read resource_kpis" on public.resource_kpis for select using (true);
create policy "public read resource_models" on public.resource_models for select using (true);
create policy "public read resource_alerts" on public.resource_alerts for select using (true);
create policy "public read timeline_events" on public.timeline_events for select using (true);
create policy "public read dashboard_kpis" on public.dashboard_kpis for select using (true);
