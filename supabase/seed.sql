-- Seed: the Anderson Economy — one parent (Alex), one kid (Maya, 7,
-- Sapling era). Fixed UUIDs so dev tooling can reference them. Runs as
-- the service role (bypasses RLS); real clients go through the RPCs.

-- Dev-only auth user for Alex. On hosted Supabase, sign-ins create real
-- rows; this minimal insert exists so the FK holds in local/dev runs.
insert into auth.users (id, email)
values ('a0000000-0000-4000-8000-00000000a1ec', 'alex@anderson.example')
on conflict (id) do nothing;

insert into households (id, name, currency_name, currency_symbol)
values ('11111111-0000-4000-8000-000000000001', 'The Anderson Economy', 'Mints', 'M');

insert into members (id, household_id, auth_user_id, role, display_name, birth_year, era) values
  ('22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-00000000a1ec', 'parent', 'Alex', 1988, 'canopy'),
  ('22222222-0000-4000-8000-000000000002', '11111111-0000-4000-8000-000000000001',
   null, 'kid', 'Maya', 2019, 'sapling');

insert into accounts (id, member_id, kind, interest_bps) values
  ('33333333-0000-4000-8000-000000000001', '22222222-0000-4000-8000-000000000002', 'wallet', 0),
  ('33333333-0000-4000-8000-000000000002', '22222222-0000-4000-8000-000000000002', 'savings', 500),
  ('33333333-0000-4000-8000-000000000003', '22222222-0000-4000-8000-000000000002', 'vault', 0),
  ('33333333-0000-4000-8000-000000000004', '22222222-0000-4000-8000-000000000002', 'education', 0);

-- Three Sundays of base income (10 Mints/week) + one week saved
insert into transactions (household_id, account_id, amount, kind, note, created_by) values
  ('11111111-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000001', 10, 'base_income', 'Weekly Mints', '22222222-0000-4000-8000-000000000001'),
  ('11111111-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000001', 10, 'base_income', 'Weekly Mints', '22222222-0000-4000-8000-000000000001'),
  ('11111111-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000001', 10, 'base_income', 'Weekly Mints', '22222222-0000-4000-8000-000000000001');

-- Maya moved 10 to savings (paired entries, shared ref)
insert into transactions (household_id, account_id, amount, kind, ref_id, created_by) values
  ('11111111-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000001', -10, 'transfer_out', '44444444-0000-4000-8000-000000000001', '22222222-0000-4000-8000-000000000001'),
  ('11111111-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000002', 10, 'transfer_in', '44444444-0000-4000-8000-000000000001', '22222222-0000-4000-8000-000000000001');

-- Jobs board: one open chore, one kid pitch awaiting the parent
insert into jobs (id, household_id, title, amount, proposed_by, assigned_to, status, recurring) values
  ('55555555-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001',
   'Water the garden', 8, '22222222-0000-4000-8000-000000000001',
   '22222222-0000-4000-8000-000000000002', 'open', 'weekly'),
  ('55555555-0000-4000-8000-000000000002', '11111111-0000-4000-8000-000000000001',
   'Wash the car', 25, '22222222-0000-4000-8000-000000000002',
   '22222222-0000-4000-8000-000000000002', 'open', null);

-- Four starter store items
insert into store_items (household_id, name, emoji, price) values
  ('11111111-0000-4000-8000-000000000001', 'Movie night pick', '🍿', 40),
  ('11111111-0000-4000-8000-000000000001', '30 min screen time', '📱', 15),
  ('11111111-0000-4000-8000-000000000001', 'Skip a chore', '🎟️', 75),
  ('11111111-0000-4000-8000-000000000001', 'Sleepover pass', '🛌', 60);
