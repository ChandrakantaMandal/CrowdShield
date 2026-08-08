-- ==========================================
-- CrowdShield Database Migration
-- ==========================================

create extension if not exists pgcrypto;

-- ==========================================
-- PROFILES
-- ==========================================

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    name text not null,
    email text unique,
    phone text,

    role text not null default 'citizen'
        check (role in ('citizen','authority','admin')),

    location jsonb,

    avatar_url text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ==========================================
-- VENUES
-- ==========================================

create table public.venues (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    location jsonb,

    map_configuration jsonb,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ==========================================
-- CROWD DATA
-- ==========================================

create table public.crowd_data (

    id uuid primary key default gen_random_uuid(),

    venue_id uuid
        references public.venues(id)
        on delete cascade,

    camera_id text not null,

    zone_id text not null,

    people_count integer not null default 0,

    density double precision not null default 0,

    speed double precision not null default 0,

    direction text,

    timestamp timestamptz default now()
);

-- ==========================================
-- RISK EVENTS
-- ==========================================

create table public.risk_events (

    id uuid primary key default gen_random_uuid(),

    venue_id uuid
        references public.venues(id)
        on delete cascade,

    zone_id text not null,

    risk_score double precision,

    risk_level text
        check (
            risk_level in
            ('SAFE','WARNING','HIGH','CRITICAL')
        ),

    reason text,

    created_at timestamptz default now()
);

-- ==========================================
-- INCIDENTS
-- ==========================================

create table public.incidents (

    id uuid primary key default gen_random_uuid(),

    user_id uuid
        references public.profiles(id)
        on delete set null,

    venue_id uuid
        references public.venues(id)
        on delete cascade,

    zone_id text,

    type text,

    description text,

    media_url text,

    status text default 'pending'
        check (
            status in
            ('pending','reviewing','resolved','rejected')
        ),

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);

-- ==========================================
-- ALERTS
-- ==========================================

create table public.alerts (

    id uuid primary key default gen_random_uuid(),

    risk_event_id uuid
        references public.risk_events(id)
        on delete cascade,

    audience text
        check (
            audience in
            ('citizen','authority','all')
        ),

    message text not null,

    language text default 'en',

    status text default 'pending'
        check (
            status in
            ('pending','sent','failed')
        ),

    sent_at timestamptz,

    created_at timestamptz default now()
);

-- ==========================================
-- INDEXES
-- ==========================================

create index idx_profiles_role
on profiles(role);

create index idx_venues_name
on venues(name);

create index idx_crowd_data_venue
on crowd_data(venue_id);

create index idx_crowd_data_zone
on crowd_data(zone_id);

create index idx_crowd_data_timestamp
on crowd_data(timestamp desc);

create index idx_risk_events_venue
on risk_events(venue_id);

create index idx_risk_events_level
on risk_events(risk_level);

create index idx_risk_events_created
on risk_events(created_at desc);

create index idx_incidents_user
on incidents(user_id);

create index idx_incidents_status
on incidents(status);

create index idx_alerts_status
on alerts(status);

create index idx_alerts_risk
on alerts(risk_event_id);

-- ==========================================
-- updated_at trigger
-- ==========================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_updated_at
before update on profiles
for each row
execute function set_updated_at();

create trigger venues_updated_at
before update on venues
for each row
execute function set_updated_at();

create trigger incidents_updated_at
before update on incidents
for each row
execute function set_updated_at();

-- ==========================================
-- Enable Row Level Security
-- ==========================================

alter table profiles enable row level security;
alter table venues enable row level security;
alter table crowd_data enable row level security;
alter table risk_events enable row level security;
alter table incidents enable row level security;
alter table alerts enable row level security;

-- ==========================================
-- PROFILES POLICIES
-- ==========================================

create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on profiles
for update
using (auth.uid() = id);

-- ==========================================
-- VENUES
-- ==========================================

create policy "Anyone can view venues"
on venues
for select
using (true);

-- ==========================================
-- CROWD DATA
-- ==========================================

create policy "Anyone can read crowd data"
on crowd_data
for select
using (true);

-- ==========================================
-- RISK EVENTS
-- ==========================================

create policy "Anyone can read risk events"
on risk_events
for select
using (true);

-- ==========================================
-- INCIDENTS
-- ==========================================

create policy "Users read own incidents"
on incidents
for select
using (user_id = auth.uid());

create policy "Users create incidents"
on incidents
for insert
with check (user_id = auth.uid());

create policy "Users update own incidents"
on incidents
for update
using (user_id = auth.uid());

-- ==========================================
-- ALERTS
-- ==========================================

create policy "Anyone can read alerts"
on alerts
for select
using (true);

-- ==========================================
-- Automatically create profile
-- ==========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        name,
        email,
        avatar_url,
        role
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            ''
        ),
        new.email,
        new.raw_user_meta_data->>'avatar_url',
        'citizen'
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();