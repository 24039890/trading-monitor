-- ================================================================
-- ICT CRT Trading Monitor — Supabase Schema
-- Run this once in Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- 1. EA STATUS TABLE
-- EA writes its full status here every tick (every 5s)
-- Mobile app reads from here
-- ────────────────────────────────────────────────────────────────
create table if not exists public.ea_status (
  id          uuid primary key default uuid_generate_v4(),
  status      jsonb not null,   -- Full EAStatus object as JSON
  created_at  timestamptz default now()
);

-- Keep only latest 100 rows to avoid bloat
create or replace function trim_ea_status()
returns trigger language plpgsql as $$
begin
  delete from public.ea_status
  where id not in (
    select id from public.ea_status
    order by created_at desc
    limit 100
  );
  return null;
end;
$$;

create trigger trim_ea_status_trigger
after insert on public.ea_status
execute function trim_ea_status();

-- ────────────────────────────────────────────────────────────────
-- 2. EA TRADES TABLE
-- EA writes open positions here
-- Mobile app reads for live trade monitor
-- ────────────────────────────────────────────────────────────────
create table if not exists public.ea_trades (
  id            uuid primary key default uuid_generate_v4(),
  ticket        bigint not null unique,
  symbol        text not null,
  type          text not null,        -- 'BUY' or 'SELL'
  lots          numeric not null,
  open_price    numeric not null,
  current_price numeric not null,
  sl            numeric default 0,
  tp            numeric default 0,
  profit        numeric not null,
  open_time     timestamptz not null,
  is_open       boolean default true,
  updated_at    timestamptz default now()
);

-- ────────────────────────────────────────────────────────────────
-- 3. EA COMMANDS TABLE
-- Mobile app writes commands here
-- EA reads and executes them, then marks as executed
-- ────────────────────────────────────────────────────────────────
create table if not exists public.ea_commands (
  id          uuid primary key default uuid_generate_v4(),
  command     text not null,          -- 'ENABLE' | 'DISABLE' | 'CLOSE_ALL' | 'STATUS'
  executed    boolean default false,
  created_at  timestamptz default now(),
  executed_at timestamptz
);

-- Auto-cleanup: delete executed commands older than 1 hour
create or replace function cleanup_old_commands()
returns trigger language plpgsql as $$
begin
  delete from public.ea_commands
  where executed = true
    and executed_at < now() - interval '1 hour';
  return null;
end;
$$;

create trigger cleanup_commands_trigger
after update on public.ea_commands
execute function cleanup_old_commands();

-- ────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- Only authenticated users can read/write
-- ────────────────────────────────────────────────────────────────
alter table public.ea_status   enable row level security;
alter table public.ea_trades   enable row level security;
alter table public.ea_commands enable row level security;

-- Allow authenticated users full access
create policy "auth_users_all" on public.ea_status
  for all to authenticated using (true) with check (true);

create policy "auth_users_all" on public.ea_trades
  for all to authenticated using (true) with check (true);

create policy "auth_users_all" on public.ea_commands
  for all to authenticated using (true) with check (true);

-- Service role (used by EA on VPS) has full access
create policy "service_role_all" on public.ea_status
  for all to service_role using (true) with check (true);

create policy "service_role_all" on public.ea_trades
  for all to service_role using (true) with check (true);

create policy "service_role_all" on public.ea_commands
  for all to service_role using (true) with check (true);

-- ────────────────────────────────────────────────────────────────
-- 5. ENABLE REALTIME
-- So mobile app gets live push updates without polling
-- ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.ea_status;
alter publication supabase_realtime add table public.ea_trades;
alter publication supabase_realtime add table public.ea_commands;
