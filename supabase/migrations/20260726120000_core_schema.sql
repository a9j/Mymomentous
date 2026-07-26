-- Phase 3: core schema.
--
-- The one rule that matters: THE LEDGER IS APPEND-ONLY. Balances are
-- never stored as editable numbers — they are always the sum of
-- transactions (see the balances view in the next migration). This is
-- what makes the 15-year promise credible and what makes bugs
-- recoverable.

-- Internal helpers live here, out of the public API surface.
create schema if not exists app;

-- Households are the economy
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,                      -- "The Anderson Economy"
  currency_name text not null default 'Mints',
  currency_symbol text not null default 'M',
  exchange_rate_cents int,                 -- 100 Mints = X cents, null until parent sets it
  kids_see_siblings boolean not null default false, -- kids see each other's balances only if the parent enables it
  created_at timestamptz default now()
);

-- Members: parents and kids in one table
create table members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households not null,
  auth_user_id uuid references auth.users,  -- null for young kids using parent device
  role text not null check (role in ('parent','kid')),
  display_name text not null,
  birth_year int,
  era text not null default 'sprout'
    check (era in ('sprout','sapling','grove','canopy','harvest')),
  joined_at timestamptz default now()
);
create index members_household_idx on members (household_id);
create index members_auth_user_idx on members (auth_user_id);

-- Accounts: each kid has wallet, savings, vault, education
create table accounts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members not null,
  kind text not null check (kind in ('wallet','savings','vault','education')),
  interest_bps int default 0,              -- 500 = 5% simulated annual
  lock_until date,                         -- vault only
  unique (member_id, kind)
);
create index accounts_member_idx on accounts (member_id);

-- The append-only ledger. Never update, never delete.
create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households not null,
  account_id uuid references accounts not null,
  amount int not null check (amount <> 0), -- positive credit, negative debit, whole Mints
  kind text not null check (kind in (
    'base_income','job_payment','proposal_payment','store_purchase',
    'transfer_in','transfer_out','interest','loan_disbursement',
    'loan_payment','bill','tax','adjustment','graduation_settlement'
  )),
  ref_id uuid,                             -- job id, store item id, loan id
  note text,
  created_by uuid references members not null,
  created_at timestamptz default now()
);
create index transactions_account_idx on transactions (account_id);
create index transactions_household_idx on transactions (household_id);
create index transactions_created_by_idx on transactions (created_by);
create index transactions_ref_idx on transactions (ref_id);

-- Enforce append-only at the database level: not even a security definer
-- RPC (or a buggy one) can rewrite history.
create function app.transactions_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'transactions are append-only; post a compensating entry instead';
end;
$$;

create trigger transactions_append_only
  before update or delete on transactions
  for each row execute function app.transactions_append_only();

-- Jobs board: chores and kid proposals in one table
create table jobs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households not null,
  title text not null,
  amount int not null check (amount > 0),
  proposed_by uuid references members not null,   -- parent chore or kid pitch
  assigned_to uuid references members,
  status text not null default 'open' check (status in
    ('open','countered','accepted','submitted','approved','declined','paid')),
  counter_amount int check (counter_amount is null or counter_amount > 0),
  recurring text check (recurring in ('daily','weekly')), -- null = one-off
  due_date date,
  created_at timestamptz default now()
);
create index jobs_household_idx on jobs (household_id);
create index jobs_proposed_by_idx on jobs (proposed_by);
create index jobs_assigned_to_idx on jobs (assigned_to);

-- House store
create table store_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households not null,
  name text not null,
  emoji text,
  price int not null check (price > 0),
  active boolean default true
);
create index store_items_household_idx on store_items (household_id);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  store_item_id uuid references store_items not null,
  member_id uuid references members not null,
  status text not null default 'pending' check (status in
    ('pending','fulfilled','refunded')),
  created_at timestamptz default now()
);
create index purchases_store_item_idx on purchases (store_item_id);
create index purchases_member_idx on purchases (member_id);

-- Later phases add: goals, bills, loans, credit_events, funds,
-- fund_positions, businesses. Not yet.
