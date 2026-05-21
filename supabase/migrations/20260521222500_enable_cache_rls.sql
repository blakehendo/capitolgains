alter table public.members enable row level security;
alter table public.members force row level security;

alter table public.transactions enable row level security;
alter table public.transactions force row level security;

revoke all on table public.members from anon, authenticated;
revoke all on table public.transactions from anon, authenticated;

grant select, insert, update, delete on table public.members to service_role;
grant select, insert, update, delete on table public.transactions to service_role;
