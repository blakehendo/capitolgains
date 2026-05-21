create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null,
  display_name text not null,
  first_name text not null,
  last_name text not null,
  chamber text not null default 'senate',
  office text,
  party text,
  state text not null,
  bioguide_id text,
  last_fetched_at timestamptz,
  cache_expires_at timestamptz,
  created_at timestamptz not null default now(),

  constraint members_chamber_check check (chamber = 'senate')
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  symbol text,
  transaction_date date not null,
  disclosure_date date not null,
  owner text not null default '',
  asset_description text not null,
  asset_type text not null,
  transaction_type text not null,
  amount_raw text not null,
  amount_range_low integer,
  amount_range_high integer,
  comment text,
  source_link text not null,
  raw_json jsonb not null,
  fetched_at timestamptz not null,

  constraint transactions_amount_range_check check (
    amount_range_low is null
    or amount_range_high is null
    or amount_range_low <= amount_range_high
  )
);

create unique index if not exists members_normalized_name_key
  on public.members (normalized_name);

create unique index if not exists transactions_v1_dedupe_key
  on public.transactions (
    member_id,
    transaction_date,
    coalesce(symbol, ''),
    transaction_type,
    amount_raw
  );

create index if not exists transactions_member_date_idx
  on public.transactions (member_id, transaction_date desc);

create index if not exists transactions_symbol_idx
  on public.transactions (symbol);

create index if not exists members_cache_expires_at_idx
  on public.members (cache_expires_at);
