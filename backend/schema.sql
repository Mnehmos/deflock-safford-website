-- DeFlock Safford — Petition signatures schema (Supabase / Postgres)
--
-- PRIVACY-FIRST DESIGN. This table holds a list of people who publicly
-- oppose a surveillance program, in a county where ICE is active and the
-- federal government has labeled "anti-fascists" domestic terrorists.
-- Treat it as sensitive. We collect the minimum and lock it down.
--
-- WHAT WE STORE:    a display name (optional), an email (for dedup +
--                   optional verification only), an optional city, a
--                   consent flag, and a timestamp.
-- WHAT WE DON'T:    no real-name requirement, no IP address, no
--                   user-agent, no analytics, no geolocation, no comments
--                   tied to identity. Less data = less harm if breached.
--
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists signatures (
  id            uuid primary key default gen_random_uuid(),
  display_name  text,                       -- optional; may be blank or a first name only
  email         text not null unique,        -- used only for dedup + optional verify
  city          text,                        -- optional, e.g. "Safford", "Thatcher"
  public_consent boolean not null default false, -- did they agree to show display_name publicly?
  verified      boolean not null default false,  -- email confirmed (optional flow)
  created_at    timestamptz not null default now()
);

-- Basic email sanity check (not validation, just a guardrail)
alter table signatures
  add constraint email_basic_shape check (position('@' in email) > 1);

-- ROW LEVEL SECURITY: the public can INSERT a signature but can NEVER
-- read the table back. Only the service role (server-side, with the
-- secret key) can read it. This means a leaked anon key cannot dump
-- the signer list.
alter table signatures enable row level security;

-- Allow inserts from the anon (public) role
create policy "anyone can sign"
  on signatures for insert
  to anon
  with check (true);

-- NO select policy for anon. Reads are denied by default under RLS.
-- The server reads the count via the service_role key only.

-- A safe public view: total count only, no rows exposed.
create or replace function public.signature_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from signatures;
$$;

grant execute on function public.signature_count() to anon;

-- A safe public view of consented display names ONLY (for a public wall,
-- if you choose to show one). Returns nothing identifying beyond what the
-- signer explicitly agreed to make public.
create or replace function public.public_signatures()
returns table(display_name text, city text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select display_name, city, created_at
  from signatures
  where public_consent = true and display_name is not null and display_name <> ''
  order by created_at desc
  limit 500;
$$;

grant execute on function public.public_signatures() to anon;
