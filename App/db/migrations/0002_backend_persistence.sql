-- ==========================================
-- CrowdShield Database Migration 0002
-- Backend persistence support
-- ==========================================

-- CROWD DATA: new columns (idempotent)
alter table public.crowd_data
    add column if not exists surge_detected boolean not null default false;

alter table public.crowd_data
    add column if not exists bottleneck boolean not null default false;

-- CROWD DATA: allow backend (anon key) to insert
drop policy if exists "Anyone can insert crowd data" on public.crowd_data;

create policy "Anyone can insert crowd data"
on public.crowd_data
for insert
with check (true);

-- RISK EVENTS: allow backend (anon key) to insert
drop policy if exists "Anyone can insert risk events" on public.risk_events;

create policy "Anyone can insert risk events"
on public.risk_events
for insert
with check (true);
