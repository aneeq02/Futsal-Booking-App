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
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles (id) on delete cascade,
  name            text not null,
  area            text not null,
  address         text not null,
  description     text,
  price_per_hour  numeric(10, 2) not null check (price_per_hour > 0),
  surface_type    text not null default 'artificial_turf'
                    check (surface_type in ('artificial_turf', 'wooden', 'concrete', 'rubber')),
  capacity        integer not null default 10 check (capacity > 0),
  is_active       boolean not null default true,
  rating          numeric(2, 1) check (rating >= 0 and rating <= 5),
  tagline         text,
  created_at      timestamptz not null default now()
);

-- Safe to re-run: adds rating/tagline to a courts table created before these
-- columns existed, without touching anything else.
alter table public.courts add column if not exists rating numeric(2, 1);
alter table public.courts add column if not exists tagline text;

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
  total_amount     numeric(10, 2) not null check (total_amount >= 0),
  payment_method   text not null check (payment_method in ('jazzcash', 'easypaisa', 'cash')),
  payment_status   text not null default 'pending' check (payment_status in ('pending', 'confirmed')),
  status           text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at       timestamptz not null default now()
);

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
-- ATOMIC BOOKING RPC
-- Locks the slot row so two players can never win the same slot,
-- computes the price from the court server-side (never trusts the client),
-- and writes the slot + booking rows in one transaction.
-- =========================================================

create or replace function public.create_booking(
  p_slot_id uuid,
  p_duration_hours integer,
  p_payment_method text
)
returns public.bookings
language plpgsql
security definer set search_path = public
as $$
declare
  v_slot     public.time_slots;
  v_court    public.courts;
  v_booking  public.bookings;
  v_slot_ids uuid[];
  v_next     public.time_slots;
  v_cursor   time;
  i          integer;
begin
  select * into v_slot from public.time_slots where id = p_slot_id for update;

  if not found then
    raise exception 'Slot not found';
  end if;

  if v_slot.status <> 'available' then
    raise exception 'Slot is no longer available';
  end if;

  select * into v_court from public.courts where id = v_slot.court_id;

  -- A multi-hour booking must claim N contiguous slot rows, not just the
  -- first one — otherwise the later hours stay "available" and can be
  -- double-booked by someone else.
  v_slot_ids := array[v_slot.id];
  v_cursor := v_slot.end_time;

  for i in 2..p_duration_hours loop
    select * into v_next from public.time_slots
      where court_id = v_slot.court_id and date = v_slot.date and start_time = v_cursor
      for update;

    if not found or v_next.status <> 'available' then
      raise exception 'Not enough consecutive slots available for the selected duration';
    end if;

    v_slot_ids := array_append(v_slot_ids, v_next.id);
    v_cursor := v_next.end_time;
  end loop;

  update public.time_slots set status = 'booked' where id = any(v_slot_ids);

  insert into public.bookings (player_id, slot_id, court_id, duration_hours, total_amount, payment_method, payment_status, status)
  values (
    auth.uid(),
    p_slot_id,
    v_slot.court_id,
    p_duration_hours,
    v_court.price_per_hour * p_duration_hours,
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
