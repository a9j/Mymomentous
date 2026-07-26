-- Minimal stand-in for the Supabase runtime environment, for running the
-- migrations + RLS tests against a plain local Postgres. Hosted Supabase
-- provides all of this already — never run this file against a real
-- Supabase project.

create role anon nologin;
create role authenticated nologin;

create schema auth;

create table auth.users (
  id uuid primary key,
  email text
);

-- Same contract as Supabase's auth.uid(): the `sub` claim of the JWT.
create function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid;
$$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

-- Supabase grants table privileges to both roles by default and lets RLS
-- do the gating; mirror that for objects the migrations create.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
