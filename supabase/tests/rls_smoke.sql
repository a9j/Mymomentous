-- RLS smoke test: two fake households, three access personas.
-- Runs as a superuser/service role that flips into the `authenticated`
-- role with simulated JWT claims, exactly the way PostgREST executes
-- queries. Every assertion raises on failure; the script ends with
-- 'RLS SMOKE TEST PASSED' only if everything held.
--
--   persona P1: parent of household A (auth user u1)
--   persona P2: parent of household B (auth user u2)
--   persona K1: kid in household A with their own device (auth user u3)
--
-- Usage: psql -f rls_smoke.sql  (after migrations; independent of seed)

\set ON_ERROR_STOP on

begin;

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'p1@test.example'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'p2@test.example'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'k1@test.example')
on conflict (id) do nothing;

create temp table ids (key text primary key, id uuid);
grant all on table ids to authenticated; -- the test flips roles mid-session

-- ---------------------------------------------------------------
-- P1 builds household A with two kids
-- ---------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001"}', true);
set local role authenticated;

insert into ids select 'hh_a', create_household('Household A', 'Parent One');
insert into ids select 'kid_a1', add_kid((select id from ids where key='hh_a'), 'Kid A1', 2019, 'sapling');
insert into ids select 'kid_a2', add_kid((select id from ids where key='hh_a'), 'Kid A2', 2021, 'sprout');

reset role;

-- Link kid A1 to their own device (auth user u3) as the parent would
update members set auth_user_id = 'aaaaaaaa-0000-4000-8000-000000000003'
  where id = (select id from ids where key='kid_a1');

-- ---------------------------------------------------------------
-- P2 builds household B
-- ---------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000002"}', true);
set local role authenticated;

insert into ids select 'hh_b', create_household('Household B', 'Parent Two');
insert into ids select 'kid_b1', add_kid((select id from ids where key='hh_b'), 'Kid B1', 2018, 'sapling');

-- P2 sees exactly one household and cannot see household A's roster
do $$
begin
  if (select count(*) from households) <> 1 then
    raise exception 'FAIL: P2 should see exactly 1 household, saw %', (select count(*) from households);
  end if;
  if exists (select 1 from members where display_name like 'Kid A%') then
    raise exception 'FAIL: P2 can see household A members';
  end if;
  if exists (select 1 from balances b join members m on m.id = b.member_id where m.display_name like 'Kid A%') then
    raise exception 'FAIL: P2 can see household A balances';
  end if;
end $$;

reset role;

-- ---------------------------------------------------------------
-- P1: fund kid A1 via a job, then exercise the RPCs
-- ---------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001"}', true);
set local role authenticated;

-- direct ledger writes are impossible, even for a parent
do $$
declare
  v_wallet uuid;
begin
  select b.account_id into v_wallet from balances b
    join members m on m.id = b.member_id
    where m.display_name = 'Kid A1' and b.kind = 'wallet';
  begin
    insert into transactions (household_id, account_id, amount, kind, created_by)
      values ((select household_id from members where display_name='Kid A1'), v_wallet, 999, 'adjustment',
              (select id from members where display_name='Parent One'));
    raise exception 'FAIL: parent inserted into transactions directly';
  exception when insufficient_privilege or sqlstate '42501' then
    null; -- expected: RLS has no insert policy on transactions
  end;
end $$;

-- post a chore, kid submits it (below), parent pays it
insert into jobs (household_id, title, amount, proposed_by, assigned_to, status)
  select (select id from ids where key='hh_a'), 'Rake leaves', 12,
         (select id from members where display_name='Parent One'),
         (select id from ids where key='kid_a1'), 'submitted';

do $$
declare v_txn uuid;
begin
  select pay_job(id) into v_txn from jobs where title = 'Rake leaves';
  if v_txn is null then raise exception 'FAIL: pay_job returned null'; end if;
  if (select balance from balances b join members m on m.id=b.member_id
        where m.display_name='Kid A1' and b.kind='wallet') <> 12 then
    raise exception 'FAIL: wallet should hold 12 after pay_job';
  end if;
  if (select status from jobs where title='Rake leaves') <> 'paid' then
    raise exception 'FAIL: job not marked paid';
  end if;
end $$;

-- paying the same job twice must fail
do $$
begin
  begin
    perform pay_job(id) from jobs where title = 'Rake leaves';
    raise exception 'FAIL: pay_job double-paid';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
end $$;

-- store: parent buys for the shared-device kid A2 — insufficient funds is math, not shame
insert into store_items (household_id, name, price)
  values ((select id from ids where key='hh_a'), 'Sticker pack', 5);
do $$
begin
  begin
    perform purchase_item((select id from store_items where name='Sticker pack'),
                          (select id from ids where key='kid_a2'));
    raise exception 'FAIL: purchase with empty wallet succeeded';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
    if sqlerrm not like 'You have 0. This costs 5.%' then
      raise exception 'FAIL: unexpected insufficient-funds message: %', sqlerrm;
    end if;
  end;
end $$;

reset role;

-- ---------------------------------------------------------------
-- K1 (kid A1 on their own device): sees self, not sibling; can move
-- own money; cannot write the ledger or touch the sibling
-- ---------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000003"}', true);
set local role authenticated;

do $$
declare
  v_wallet uuid; v_savings uuid; v_sibling_wallet uuid;
begin
  -- sees own balances only (kids_see_siblings defaults false)
  if (select count(*) from balances) <> 4 then
    raise exception 'FAIL: kid should see exactly their own 4 accounts, saw %', (select count(*) from balances);
  end if;
  if exists (select 1 from balances b join members m on m.id=b.member_id where m.display_name='Kid A2') then
    raise exception 'FAIL: kid can see sibling balances';
  end if;

  select account_id into v_wallet from balances where kind='wallet';
  select account_id into v_savings from balances where kind='savings';

  -- kid moves 5 of their own Mints to savings
  perform transfer(v_wallet, v_savings, 5);
  if (select balance from balances where kind='savings') <> 5 then
    raise exception 'FAIL: savings should hold 5 after transfer';
  end if;

  -- overdraft is refused with math
  begin
    perform transfer(v_wallet, v_savings, 100);
    raise exception 'FAIL: overdraft transfer succeeded';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;

  -- direct ledger write refused
  begin
    insert into transactions (household_id, account_id, amount, kind, created_by)
      values ((select household_id from members limit 1), v_wallet, 500, 'adjustment',
              (select id from members where display_name='Kid A1'));
    raise exception 'FAIL: kid inserted into transactions directly';
  exception when insufficient_privilege or sqlstate '42501' then
    null;
  end;

  -- sibling's wallet is invisible, so transferring from it can't even resolve
  select a.id into v_sibling_wallet from accounts a
    join members m on m.id = a.member_id
    where m.display_name = 'Kid A2' and a.kind = 'wallet';
  if v_sibling_wallet is not null then
    raise exception 'FAIL: kid can see sibling account rows';
  end if;
end $$;

reset role;

-- ---------------------------------------------------------------
-- Ledger is append-only even for the service role
-- ---------------------------------------------------------------
do $$
begin
  begin
    update transactions set amount = 1;
    raise exception 'FAIL: ledger update was allowed';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    delete from transactions;
    raise exception 'FAIL: ledger delete was allowed';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
end $$;

select 'RLS SMOKE TEST PASSED' as result;

rollback; -- leave no test data behind
