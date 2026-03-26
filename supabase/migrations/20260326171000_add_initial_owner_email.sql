insert into public.owner_accounts (user_id, email, note)
values (
  '00000000-0000-0000-0000-000000000000',
  'JCHkeeper@gmail.com',
  'Initial owner email bootstrap'
)
on conflict (user_id) do update set
  email = excluded.email,
  note = excluded.note;
