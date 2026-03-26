create policy "public insert hunters" on public.hunters for insert with check (true);
create policy "public update hunters" on public.hunters for update using (true) with check (true);

create policy "public insert tasks" on public.tasks for insert with check (true);
create policy "public update tasks" on public.tasks for update using (true) with check (true);

create policy "public insert task_logs" on public.task_logs for insert with check (true);
create policy "public insert task_actions" on public.task_actions for insert with check (true);
