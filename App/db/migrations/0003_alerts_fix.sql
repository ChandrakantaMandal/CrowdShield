-- ==========================================
-- CrowdShield Database Migration 0003
-- Alert persistence support
-- ==========================================

-- ALERTS: new columns for backend alert rows (idempotent)
alter table public.alerts
    add column if not exists zone_id text;

alter table public.alerts
    add column if not exists risk_level text
        check (risk_level in ('SAFE', 'WARNING', 'HIGH', 'CRITICAL'));

-- ALERTS: allow backend (anon key) to insert
drop policy if exists "Anyone can insert alerts" on public.alerts;

create policy "Anyone can insert alerts"
on public.alerts
for insert
with check (true);