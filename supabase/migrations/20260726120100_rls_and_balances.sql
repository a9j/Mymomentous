-- Phase 3: RLS on every table + the balances view.
--
-- Access model:
--   * members see only their household
--   * kids see their own accounts/transactions; siblings' only when the
--     parent enables households.kids_see_siblings
--   * kids (and parents) cannot write to the ledger directly — all money
--     mutations go through the security definer RPCs in the next
--     migration
--   * balances are a security_invoker view over the ledger, so reading a
--     balance is subject to exactly the same RLS as the transactions

-- ---------------------------------------------------------------------
-- Helpers (security definer so RLS on members doesn't recurse).
-- auth.uid() is wrapped in a scalar subquery for per-statement caching.
-- ---------------------------------------------------------------------

create function app.my_households() returns setof uuid
language sql stable security definer set search_path = public as $$
  select household_id from members where auth_user_id = (select auth.uid());
$$;

create function app.my_member_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from members where auth_user_id = (select auth.uid());
$$;

create function app.is_parent(hh uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from members
    where household_id = hh
      and auth_user_id = (select auth.uid())
      and role = 'parent'
  );
$$;

-- Can the caller see this member's money? Parents: all of the household.
-- Kids: themselves, plus siblings when the parent has enabled it.
create function app.can_see_member(target_member uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from members me
    join members t on t.household_id = me.household_id
    join households h on h.id = me.household_id
    where t.id = target_member
      and me.auth_user_id = (select auth.uid())
      and (me.role = 'parent' or t.id = me.id or h.kids_see_siblings)
  );
$$;

grant usage on schema app to authenticated;
grant execute on function app.my_households(), app.my_member_ids(),
  app.is_parent(uuid), app.can_see_member(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------

alter table households enable row level security;
alter table members enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table jobs enable row level security;
alter table store_items enable row level security;
alter table purchases enable row level security;

-- households: creation happens only via the create_household RPC
create policy households_select on households for select
  using (id in (select app.my_households()));
create policy households_update on households for update
  using (app.is_parent(id)) with check (app.is_parent(id));

-- members: parents manage the roster
create policy members_select on members for select
  using (household_id in (select app.my_households()));
create policy members_insert on members for insert
  with check (app.is_parent(household_id));
create policy members_update on members for update
  using (app.is_parent(household_id)) with check (app.is_parent(household_id));

-- accounts: visibility follows the member; parents manage settings
-- (interest_bps, vault lock)
create policy accounts_select on accounts for select
  using (app.can_see_member(member_id));
create policy accounts_insert on accounts for insert
  with check (app.is_parent((select household_id from members m where m.id = member_id)));
create policy accounts_update on accounts for update
  using (app.is_parent((select household_id from members m where m.id = member_id)))
  with check (app.is_parent((select household_id from members m where m.id = member_id)));

-- transactions: read-only through RLS. No insert/update/delete policies
-- exist on purpose — the client NEVER writes the ledger directly; the
-- security definer RPCs do.
create policy transactions_select on transactions for select
  using (exists (
    select 1 from accounts a
    where a.id = account_id and app.can_see_member(a.member_id)
  ));

-- jobs: anyone in the household can post (parent chore or kid pitch) as
-- themselves; parents and the involved kid can update. Status-machine
-- enforcement tightens in Phase 5's job RPCs.
create policy jobs_select on jobs for select
  using (household_id in (select app.my_households()));
create policy jobs_insert on jobs for insert
  with check (
    household_id in (select app.my_households())
    and proposed_by in (select app.my_member_ids())
  );
create policy jobs_update on jobs for update
  using (
    app.is_parent(household_id)
    or proposed_by in (select app.my_member_ids())
    or assigned_to in (select app.my_member_ids())
  )
  with check (household_id in (select app.my_households()));

-- store: everyone reads, parents manage
create policy store_items_select on store_items for select
  using (household_id in (select app.my_households()));
create policy store_items_insert on store_items for insert
  with check (app.is_parent(household_id));
create policy store_items_update on store_items for update
  using (app.is_parent(household_id)) with check (app.is_parent(household_id));

-- purchases: created only via the purchase_item RPC; parents fulfill
create policy purchases_select on purchases for select
  using (
    member_id in (select app.my_member_ids())
    or app.is_parent((select household_id from members m where m.id = member_id))
  );
create policy purchases_update on purchases for update
  using (app.is_parent((select household_id from members m where m.id = member_id)))
  with check (app.is_parent((select household_id from members m where m.id = member_id)));

-- ---------------------------------------------------------------------
-- Balances: always a sum, never a column. security_invoker means the
-- caller's RLS on accounts/transactions applies.
-- ---------------------------------------------------------------------

create view balances with (security_invoker = on) as
  select
    a.id as account_id,
    a.member_id,
    a.kind,
    coalesce(sum(t.amount), 0)::int as balance
  from accounts a
  left join transactions t on t.account_id = a.id
  group by a.id, a.member_id, a.kind;

grant select on balances to authenticated;
