-- Phase 3: all money mutations go through these RPCs. Each validates,
-- then inserts into the append-only ledger. The client never touches
-- transactions directly (RLS has no write policies on it).
--
-- All functions are security definer with a pinned search_path, and are
-- executable by authenticated users only.

-- Resolve the calling auth user's member row in a household, or raise.
create function app.require_member(hh uuid) returns members
language plpgsql stable security definer set search_path = public as $$
declare m members;
begin
  select * into m from members
    where household_id = hh and auth_user_id = (select auth.uid());
  if m.id is null then
    raise exception 'not a member of this household';
  end if;
  return m;
end;
$$;

create function app.ledger_balance(p_account uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0)::int from transactions where account_id = p_account;
$$;

-- ---------------------------------------------------------------------
-- create_household: onboarding entry point. Creates the economy and the
-- calling user as its first parent.
-- ---------------------------------------------------------------------
create function public.create_household(
  p_name text,
  p_display_name text,
  p_currency_name text default 'Mints',
  p_currency_symbol text default 'M'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_household uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;
  insert into households (name, currency_name, currency_symbol)
    values (p_name, p_currency_name, p_currency_symbol)
    returning id into v_household;
  insert into members (household_id, auth_user_id, role, display_name)
    values (v_household, (select auth.uid()), 'parent', p_display_name);
  return v_household;
end;
$$;

-- ---------------------------------------------------------------------
-- add_kid: parent adds a kid; the four accounts come with them.
-- Savings starts at 5% simulated annual interest.
-- ---------------------------------------------------------------------
create function public.add_kid(
  p_household uuid,
  p_display_name text,
  p_birth_year int default null,
  p_era text default 'sprout'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_kid uuid;
begin
  if not app.is_parent(p_household) then
    raise exception 'only a parent can add kids';
  end if;
  insert into members (household_id, role, display_name, birth_year, era)
    values (p_household, 'kid', p_display_name, p_birth_year, p_era)
    returning id into v_kid;
  insert into accounts (member_id, kind, interest_bps) values
    (v_kid, 'wallet', 0),
    (v_kid, 'savings', 500),
    (v_kid, 'vault', 0),
    (v_kid, 'education', 0);
  return v_kid;
end;
$$;

-- ---------------------------------------------------------------------
-- pay_job: parent approves a submitted job with one tap. Pays the
-- effective price (the accepted counter when there is one) into the
-- kid's wallet. Kind records whether this was a parent chore or a kid
-- pitch — proposal_payment is the product's soul and gets its own line.
-- ---------------------------------------------------------------------
create function public.pay_job(p_job uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_job jobs;
  v_parent members;
  v_wallet uuid;
  v_kind text;
  v_amount int;
  v_txn uuid;
begin
  select * into v_job from jobs where id = p_job for update;
  if v_job.id is null then
    raise exception 'job not found';
  end if;
  v_parent := app.require_member(v_job.household_id);
  if v_parent.role <> 'parent' then
    raise exception 'only a parent can pay a job';
  end if;
  if v_job.status <> 'submitted' then
    raise exception 'job must be submitted before it can be paid (status: %)', v_job.status;
  end if;
  if v_job.assigned_to is null then
    raise exception 'job has no assignee';
  end if;

  select id into v_wallet from accounts
    where member_id = v_job.assigned_to and kind = 'wallet';
  if v_wallet is null then
    raise exception 'assignee has no wallet';
  end if;

  select case when role = 'kid' then 'proposal_payment' else 'job_payment' end
    into v_kind from members where id = v_job.proposed_by;
  v_amount := coalesce(v_job.counter_amount, v_job.amount);

  update jobs set status = 'paid' where id = p_job;
  insert into transactions (household_id, account_id, amount, kind, ref_id, note, created_by)
    values (v_job.household_id, v_wallet, v_amount, v_kind, v_job.id, v_job.title, v_parent.id)
    returning id into v_txn;
  return v_txn;
end;
$$;

-- ---------------------------------------------------------------------
-- purchase_item: kid buys from the house store. On a shared device the
-- parent passes p_member to act for the kid; a signed-in kid omits it.
-- Never shame, always math: the error carries the numbers.
-- ---------------------------------------------------------------------
create function public.purchase_item(p_item uuid, p_member uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_item store_items;
  v_actor members;
  v_buyer uuid;
  v_wallet uuid;
  v_balance int;
  v_purchase uuid;
begin
  select * into v_item from store_items where id = p_item;
  if v_item.id is null or not coalesce(v_item.active, false) then
    raise exception 'item is not available';
  end if;
  v_actor := app.require_member(v_item.household_id);

  if p_member is null or p_member = v_actor.id then
    v_buyer := v_actor.id;
  else
    if v_actor.role <> 'parent' then
      raise exception 'only a parent can buy on behalf of another member';
    end if;
    if not exists (select 1 from members where id = p_member and household_id = v_item.household_id) then
      raise exception 'buyer is not in this household';
    end if;
    v_buyer := p_member;
  end if;

  select id into v_wallet from accounts where member_id = v_buyer and kind = 'wallet';
  if v_wallet is null then
    raise exception 'buyer has no wallet';
  end if;
  v_balance := app.ledger_balance(v_wallet);
  if v_balance < v_item.price then
    raise exception 'You have %. This costs %. % to go.',
      v_balance, v_item.price, v_item.price - v_balance;
  end if;

  insert into transactions (household_id, account_id, amount, kind, ref_id, note, created_by)
    values (v_item.household_id, v_wallet, -v_item.price, 'store_purchase', v_item.id, v_item.name, v_actor.id);
  insert into purchases (store_item_id, member_id)
    values (v_item.id, v_buyer)
    returning id into v_purchase;
  return v_purchase;
end;
$$;

-- ---------------------------------------------------------------------
-- transfer: move Mints between one member's own accounts (wallet ↔
-- savings ↔ vault ↔ education). The kid moves their own money; a parent
-- may move it for them. Vault early withdrawal is impossible — not
-- penalized, impossible (§ Phase 7).
-- Returns the shared ref_id linking the paired ledger entries.
-- ---------------------------------------------------------------------
create function public.transfer(p_from uuid, p_to uuid, p_amount int) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_from accounts;
  v_to accounts;
  v_actor members;
  v_household uuid;
  v_balance int;
  v_ref uuid := gen_random_uuid();
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  if p_from = p_to then
    raise exception 'cannot transfer an account to itself';
  end if;

  select * into v_from from accounts where id = p_from for update;
  select * into v_to from accounts where id = p_to for update;
  if v_from.id is null or v_to.id is null then
    raise exception 'account not found';
  end if;
  if v_from.member_id <> v_to.member_id then
    raise exception 'transfers move money between one member''s own accounts';
  end if;

  select household_id into v_household from members where id = v_from.member_id;
  v_actor := app.require_member(v_household);
  if v_actor.role <> 'parent' and v_actor.id <> v_from.member_id then
    raise exception 'you can only move your own Mints';
  end if;

  if v_from.kind = 'vault' and v_from.lock_until is not null and v_from.lock_until > current_date then
    raise exception 'the vault is locked until %', v_from.lock_until;
  end if;

  v_balance := app.ledger_balance(v_from.id);
  if v_balance < p_amount then
    raise exception 'You have %. That transfer needs %.', v_balance, p_amount;
  end if;

  insert into transactions (household_id, account_id, amount, kind, ref_id, created_by) values
    (v_household, v_from.id, -p_amount, 'transfer_out', v_ref, v_actor.id),
    (v_household, v_to.id,    p_amount, 'transfer_in',  v_ref, v_actor.id);
  return v_ref;
end;
$$;

-- ---------------------------------------------------------------------
-- Lock down execution: authenticated users only.
-- ---------------------------------------------------------------------
revoke execute on function
  public.create_household(text, text, text, text),
  public.add_kid(uuid, text, int, text),
  public.pay_job(uuid),
  public.purchase_item(uuid, uuid),
  public.transfer(uuid, uuid, int),
  app.require_member(uuid),
  app.ledger_balance(uuid)
from public, anon;

grant execute on function
  public.create_household(text, text, text, text),
  public.add_kid(uuid, text, int, text),
  public.pay_job(uuid),
  public.purchase_item(uuid, uuid),
  public.transfer(uuid, uuid, int)
to authenticated;
