create table if not exists public.owner_accounts (
  user_id uuid primary key,
  email text unique,
  note text,
  created_at timestamptz not null default now()
);

alter table public.owner_accounts enable row level security;

drop policy if exists "public read owner_accounts" on public.owner_accounts;
create policy "owners can read owner_accounts" on public.owner_accounts
for select using (auth.uid() = user_id);

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.owner_accounts oa where oa.user_id = auth.uid()
  );
$$;

-- remove temporary public write access

drop policy if exists "public insert hunters" on public.hunters;
drop policy if exists "public update hunters" on public.hunters;
drop policy if exists "public insert tasks" on public.tasks;
drop policy if exists "public update tasks" on public.tasks;
drop policy if exists "public insert task_logs" on public.task_logs;
drop policy if exists "public insert task_actions" on public.task_actions;

-- owner-only writes
create policy "owner insert hunters" on public.hunters for insert with check (public.is_owner());
create policy "owner update hunters" on public.hunters for update using (public.is_owner()) with check (public.is_owner());
create policy "owner insert tasks" on public.tasks for insert with check (public.is_owner());
create policy "owner update tasks" on public.tasks for update using (public.is_owner()) with check (public.is_owner());
create policy "owner insert task_logs" on public.task_logs for insert with check (public.is_owner());
create policy "owner insert task_actions" on public.task_actions for insert with check (public.is_owner());
