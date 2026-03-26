create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.owner_accounts oa
    where oa.user_id = auth.uid()
       or lower(coalesce(oa.email, '')) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  );
$$;
