-- Futsal Booking App — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Requires: pgcrypto (for gen_random_uuid) — enabled by default on Supabase.

-- =========================================================
-- TABLES
-- =========================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'player' check (role in ('player', 'owner')),
  full_name   text not null,
  phone       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.courts (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references public.profiles (id) on delete cascade,
  name               text not null,
  area               text not null,
  address            text not null,
  price_per_hour     numeric(10, 2) not null check (price_per_hour > 0),
  format             text not null default '7v7' check (format in ('5v5', '6v6', '7v7', '8v8')),
  allows_half_court  boolean not null default false,
  opens_at           time not null default '08:00',
  closes_at          time not null default '22:00',
  is_active          boolean not null default true,
  rating             numeric(2, 1) check (rating >= 0 and rating <= 5),
  created_at         timestamptz not null default now()
);

-- Safe to re-run against a courts table created before this shape existed:
-- adds the current columns and drops the ones that are no longer part of
-- the product (description, surface_type, tagline, capacity) without
-- touching anything else.
alter table public.courts add column if not exists rating numeric(2, 1);
alter table public.courts add column if not exists format text not null default '7v7';
alter table public.courts add column if not exists allows_half_court boolean not null default false;
-- opens_at/closes_at give each owner full control of their own hours. A
-- court whose closes_at is <= its opens_at is treated as an overnight
-- session (e.g. 16:00 -> 12:00 the next day) by generate_slots_for_court().
alter table public.courts add column if not exists opens_at time not null default '08:00';
alter table public.courts add column if not exists closes_at time not null default '22:00';
alter table public.courts drop column if exists description;
alter table public.courts drop column if exists surface_type;
alter table public.courts drop column if exists tagline;
alter table public.courts drop column if exists capacity;
alter table public.courts drop constraint if exists courts_format_check;
alter table public.courts add constraint courts_format_check check (format in ('5v5', '6v6', '7v7', '8v8'));

create table if not exists public.court_photos (
  id            uuid primary key default gen_random_uuid(),
  court_id      uuid not null references public.courts (id) on delete cascade,
  storage_path  text not null,
  is_primary    boolean not null default false,
  uploaded_at   timestamptz not null default now()
);

create table if not exists public.time_slots (
  id          uuid primary key default gen_random_uuid(),
  court_id    uuid not null references public.courts (id) on delete cascade,
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  status      text not null default 'available'
                check (status in ('available', 'booked', 'blocked')),
  unique (court_id, date, start_time)
);

create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  player_id        uuid not null references public.profiles (id) on delete cascade,
  slot_id          uuid not null references public.time_slots (id) on delete cascade,
  court_id         uuid not null references public.courts (id) on delete cascade,
  duration_hours   integer not null default 1 check (duration_hours > 0),
  court_portion    text not null default 'full' check (court_portion in ('full', 'half')),
  total_amount     numeric(10, 2) not null check (total_amount >= 0),
  payment_method   text not null check (payment_method in ('jazzcash', 'easypaisa', 'cash')),
  payment_status   text not null default 'pending' check (payment_status in ('pending', 'confirmed')),
  status           text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at       timestamptz not null default now()
);

alter table public.bookings add column if not exists court_portion text not null default 'full';
alter table public.bookings drop constraint if exists bookings_court_portion_check;
alter table public.bookings add constraint bookings_court_portion_check check (court_portion in ('full', 'half'));

create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  plan        text not null default 'basic' check (plan in ('basic', 'pro', 'premium')),
  status      text not null default 'active' check (status in ('active', 'past_due', 'cancelled')),
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz
);

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists courts_owner_id_idx on public.courts (owner_id);
create index if not exists courts_area_idx on public.courts (area);
create index if not exists court_photos_court_id_idx on public.court_photos (court_id);
create index if not exists time_slots_court_id_date_idx on public.time_slots (court_id, date);
create index if not exists bookings_player_id_idx on public.bookings (player_id);
create index if not exists bookings_court_id_idx on public.bookings (court_id);
create index if not exists subscriptions_owner_id_idx on public.subscriptions (owner_id);

-- =========================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'player'),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- AUTOMATIC SLOT GENERATION
-- Each court sets its own opens_at/closes_at (see courts table above). A
-- session whose closes_at is <= its opens_at is treated as spanning
-- midnight: hours up to 23:00 are stamped with the given date, the
-- remainder with the following date. Both functions only ever insert —
-- existing rows (including booked/blocked ones) are left untouched via
-- ON CONFLICT DO NOTHING, so they're safe to call repeatedly.
-- =========================================================

create or replace function public.generate_slots_for_court(p_court_id uuid, p_date date)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_court public.courts;
  v_hour  integer;
begin
  select * into v_court from public.courts where id = p_court_id;

  if not found then
    raise exception 'Court not found';
  end if;

  if v_court.closes_at > v_court.opens_at then
    for v_hour in extract(hour from v_court.opens_at)::int .. extract(hour from v_court.closes_at)::int - 1 loop
      insert into public.time_slots (court_id, date, start_time, end_time)
      values (p_court_id, p_date, make_time(v_hour, 0, 0), make_time((v_hour + 1) % 24, 0, 0))
      on conflict (court_id, date, start_time) do nothing;
    end loop;
  else
    -- Overnight session: opens_at..23:00 stays on p_date, 00:00..closes_at
    -- carries over onto p_date + 1 (mirrors how create_booking() below
    -- walks consecutive-hour bookings across that same date boundary).
    for v_hour in extract(hour from v_court.opens_at)::int .. 23 loop
      insert into public.time_slots (court_id, date, start_time, end_time)
      values (p_court_id, p_date, make_time(v_hour, 0, 0), make_time((v_hour + 1) % 24, 0, 0))
      on conflict (court_id, date, start_time) do nothing;
    end loop;

    for v_hour in 0 .. extract(hour from v_court.closes_at)::int - 1 loop
      insert into public.time_slots (court_id, date, start_time, end_time)
      values (p_court_id, p_date + 1, make_time(v_hour, 0, 0), make_time(v_hour + 1, 0, 0))
      on conflict (court_id, date, start_time) do nothing;
    end loop;
  end if;
end;
$$;

create or replace function public.generate_upcoming_slots(p_court_id uuid, p_days integer default 14)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_offset integer;
begin
  for v_offset in 0 .. p_days - 1 loop
    perform public.generate_slots_for_court(p_court_id, current_date + v_offset);
  end loop;
end;
$$;

-- Called on a daily schedule (see the pg_cron block at the bottom of this
-- file) so every active court's slot window keeps rolling forward without
-- an owner ever having to press "generate" — new players always see the
-- next p_days days regardless of when a court was last visited.
create or replace function public.generate_upcoming_slots_all_courts(p_days integer default 14)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_court record;
begin
  for v_court in select id from public.courts where is_active = true loop
    perform public.generate_upcoming_slots(v_court.id, p_days);
  end loop;
end;
$$;

-- generate_slots_for_court() only ever inserts, so slots need a separate
-- sweep to disappear once they're no longer valid options. Deletes stale
-- AVAILABLE slots in two cases — booked/blocked rows are NEVER touched by
-- either, so an existing reservation can never be silently dropped:
--   1. Outside a court's current opens_at/closes_at (e.g. hours were
--      narrowed after slots already existed for the wider window, or a
--      court had slots generated before opens_at/closes_at existed).
--   2. In the past (Karachi time) — a slot that already started is not a
--      real option any more regardless of hours.
create or replace function public.cleanup_stale_slots()
returns integer
language sql
security definer set search_path = public
as $$
  with deleted as (
    delete from public.time_slots ts
    using public.courts c
    where ts.court_id = c.id
      and ts.status = 'available'
      and (
        not (
          case
            when c.closes_at > c.opens_at then ts.start_time >= c.opens_at and ts.start_time < c.closes_at
            else ts.start_time >= c.opens_at or ts.start_time < c.closes_at
          end
        )
        or (ts.date + ts.start_time) <= (now() at time zone 'Asia/Karachi')
      )
    returning ts.id
  )
  select count(*)::integer from deleted;
$$;

-- =========================================================
-- ATOMIC BOOKING RPC
-- Locks the slot row so two players can never win the same slot,
-- computes the price from the court server-side (never trusts the client),
-- and writes the slot + booking rows in one transaction.
-- =========================================================

-- Postgres treats a changed parameter list as a distinct overload rather
-- than replacing the function in place, so the old 3-arg signature (from
-- before p_court_portion existed) is dropped explicitly to avoid ending up
-- with two ambiguous create_booking functions after a re-run.
drop function if exists public.create_booking(uuid, integer, text);

create or replace function public.create_booking(
  p_slot_id uuid,
  p_duration_hours integer,
  p_payment_method text,
  p_court_portion text default 'full'
)
returns public.bookings
language plpgsql
security definer set search_path = public
as $$
declare
  v_slot        public.time_slots;
  v_court       public.courts;
  v_booking     public.bookings;
  v_slot_ids    uuid[];
  v_next        public.time_slots;
  v_cursor_date date;
  v_cursor_time time;
  i             integer;
  v_rate        numeric(10, 2);
begin
  if p_court_portion not in ('full', 'half') then
    raise exception 'Invalid court portion';
  end if;

  select * into v_slot from public.time_slots where id = p_slot_id for update;

  if not found then
    raise exception 'Slot not found';
  end if;

  if v_slot.status <> 'available' then
    raise exception 'Slot is no longer available';
  end if;

  -- The UI filters out slots whose start time has already passed, but
  -- that's a display concern only — a client sitting on a stale page (or
  -- calling this RPC directly) must not be able to book a slot that's
  -- already begun. Compared in Karachi wall-clock time, same as the
  -- frontend's isPastKarachi(), since this app has one market/timezone.
  if (v_slot.date + v_slot.start_time) <= (now() at time zone 'Asia/Karachi') then
    raise exception 'This slot has already passed';
  end if;

  select * into v_court from public.courts where id = v_slot.court_id;

  if p_court_portion = 'half' and not v_court.allows_half_court then
    raise exception 'This court does not offer half-court bookings';
  end if;

  v_rate := v_court.price_per_hour * (case when p_court_portion = 'half' then 0.5 else 1 end);

  -- A multi-hour booking must claim N contiguous slot rows, not just the
  -- first one — otherwise the later hours stay "available" and can be
  -- double-booked by someone else. Overnight courts stamp hours past
  -- midnight with the following calendar date (see generate_slots_for_court
  -- above), so the cursor must roll the date forward whenever a slot's
  -- end_time wraps to 00:00, not just walk start_time within the same date.
  v_slot_ids := array[v_slot.id];
  v_cursor_date := v_slot.date;
  v_cursor_time := v_slot.end_time;
  if v_cursor_time = '00:00:00'::time then
    v_cursor_date := v_cursor_date + 1;
  end if;

  for i in 2..p_duration_hours loop
    select * into v_next from public.time_slots
      where court_id = v_slot.court_id and date = v_cursor_date and start_time = v_cursor_time
      for update;

    if not found or v_next.status <> 'available' then
      raise exception 'Not enough consecutive slots available for the selected duration';
    end if;

    v_slot_ids := array_append(v_slot_ids, v_next.id);
    v_cursor_time := v_next.end_time;
    if v_cursor_time = '00:00:00'::time then
      v_cursor_date := v_cursor_date + 1;
    end if;
  end loop;

  update public.time_slots set status = 'booked' where id = any(v_slot_ids);

  insert into public.bookings (player_id, slot_id, court_id, duration_hours, court_portion, total_amount, payment_method, payment_status, status)
  values (
    auth.uid(),
    p_slot_id,
    v_slot.court_id,
    p_duration_hours,
    p_court_portion,
    v_rate * p_duration_hours,
    p_payment_method,
    case when p_payment_method = 'cash' then 'pending' else 'confirmed' end,
    'confirmed'
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.court_photos enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.subscriptions enable row level security;

-- Every policy is dropped first so this whole file can be re-run safely
-- against a database that already has them (e.g. after adding a column).

-- profiles: everyone can read (needed to show owner/player names), only the owner can edit their own row
drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable" on public.profiles
  for select using (true);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- courts: active courts are publicly readable; owners manage their own (active or not)
drop policy if exists "active courts are publicly readable" on public.courts;
create policy "active courts are publicly readable" on public.courts
  for select using (is_active = true or owner_id = auth.uid());

drop policy if exists "owners can insert their own courts" on public.courts;
create policy "owners can insert their own courts" on public.courts
  for insert with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "owners can update their own courts" on public.courts;
create policy "owners can update their own courts" on public.courts
  for update using (owner_id = auth.uid());

drop policy if exists "owners can delete their own courts" on public.courts;
create policy "owners can delete their own courts" on public.courts
  for delete using (owner_id = auth.uid());

-- court_photos: readable wherever the court is readable; only the owning owner can manage
drop policy if exists "court photos are publicly readable" on public.court_photos;
create policy "court photos are publicly readable" on public.court_photos
  for select using (
    exists (
      select 1 from public.courts c
      where c.id = court_photos.court_id and (c.is_active = true or c.owner_id = auth.uid())
    )
  );

drop policy if exists "owners can manage their court photos" on public.court_photos;
create policy "owners can manage their court photos" on public.court_photos
  for all using (
    exists (select 1 from public.courts c where c.id = court_photos.court_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.courts c where c.id = court_photos.court_id and c.owner_id = auth.uid())
  );

-- time_slots: readable wherever the court is readable; only the owning owner can manage directly
-- (players never update slot status directly — see create_booking() above)
drop policy if exists "time slots are publicly readable" on public.time_slots;
create policy "time slots are publicly readable" on public.time_slots
  for select using (
    exists (
      select 1 from public.courts c
      where c.id = time_slots.court_id and (c.is_active = true or c.owner_id = auth.uid())
    )
  );

drop policy if exists "owners can manage their time slots" on public.time_slots;
create policy "owners can manage their time slots" on public.time_slots
  for all using (
    exists (select 1 from public.courts c where c.id = time_slots.court_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.courts c where c.id = time_slots.court_id and c.owner_id = auth.uid())
  );

-- bookings: players see their own bookings, owners see bookings on their courts
drop policy if exists "players can read their own bookings" on public.bookings;
create policy "players can read their own bookings" on public.bookings
  for select using (player_id = auth.uid());

drop policy if exists "owners can read bookings on their courts" on public.bookings;
create policy "owners can read bookings on their courts" on public.bookings
  for select using (
    exists (select 1 from public.courts c where c.id = bookings.court_id and c.owner_id = auth.uid())
  );

drop policy if exists "players can cancel their own bookings" on public.bookings;
create policy "players can cancel their own bookings" on public.bookings
  for update using (player_id = auth.uid())
  with check (player_id = auth.uid() and status = 'cancelled');

drop policy if exists "owners can update bookings on their courts" on public.bookings;
create policy "owners can update bookings on their courts" on public.bookings
  for update using (
    exists (select 1 from public.courts c where c.id = bookings.court_id and c.owner_id = auth.uid())
  );

-- subscriptions: owners can read their own subscription; writes are managed server-side (service role)
drop policy if exists "owners can read their own subscription" on public.subscriptions;
create policy "owners can read their own subscription" on public.subscriptions
  for select using (owner_id = auth.uid());

-- =========================================================
-- STORAGE — court photo uploads
-- =========================================================

insert into storage.buckets (id, name, public)
values ('court-photos', 'court-photos', true)
on conflict (id) do nothing;

drop policy if exists "court photos are publicly viewable" on storage.objects;
create policy "court photos are publicly viewable" on storage.objects
  for select using (bucket_id = 'court-photos');

drop policy if exists "owners can upload court photos" on storage.objects;
create policy "owners can upload court photos" on storage.objects
  for insert with check (
    bucket_id = 'court-photos'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "owners can update their own court photos" on storage.objects;
create policy "owners can update their own court photos" on storage.objects
  for update using (bucket_id = 'court-photos' and owner = auth.uid());

drop policy if exists "owners can delete their own court photos" on storage.objects;
create policy "owners can delete their own court photos" on storage.objects
  for delete using (bucket_id = 'court-photos' and owner = auth.uid());

-- =========================================================
-- SCHEDULED JOBS (best-effort)
-- Keeps every active court's rolling 14-day slot window topped up once a
-- day, and sweeps out past/stale AVAILABLE slots hourly, via pg_cron —
-- independent of player traffic. The app also calls generate_upcoming_
-- slots() lazily whenever a court's page is visited (lib/supabase/
-- queries.ts -> getCourtById) and whenever a court is created/edited, and
-- create_booking() already rejects a passed slot server-side regardless
-- of whether this cleanup has run yet — so this whole block is
-- defense-in-depth/tidiness rather than a hard requirement. If pg_cron
-- isn't enabled on this Supabase project, the exception is swallowed and
-- schema.sql still finishes applying cleanly.
-- =========================================================

do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule(
    'generate-upcoming-slots-daily',
    '0 0 * * *',
    $cron$select public.generate_upcoming_slots_all_courts(14);$cron$
  );
  perform cron.schedule(
    'cleanup-stale-slots-hourly',
    '0 * * * *',
    $cron$select public.cleanup_stale_slots();$cron$
  );
exception when others then
  raise notice 'Skipping pg_cron schedule (pg_cron not available on this project): %', sqlerrm;
end $$;
