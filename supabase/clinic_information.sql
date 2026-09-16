-- SPM Dental Care — Clinic information + gallery
-- Run this once in the Supabase SQL Editor after admin_dashboard.sql.
-- This file creates a single admin-managed clinic settings table and a
-- gallery table that store only image URLs / storage paths (not binary data).
-- It safely re-runs because each statement is idempotent.

-- ============================================================================
-- 1. Storage bucket for gallery images
-- ============================================================================
-- The app stores image files in a dedicated public bucket and keeps only the
-- public URL / storage path in the database. This avoids bloating the DB while
-- keeping the public site fast and the admin able to replace/remove images.

create extension if not exists "uuid-ossp";

insert into storage.buckets (id, name, public)
values ('clinic-gallery', 'clinic-gallery', true)
on conflict (id) do nothing;

-- ============================================================================
-- 2. Clinic settings table
-- ============================================================================
create table if not exists public.clinic_settings (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null default 'SPM Dental Care',
  location_heading text not null default 'Find us in Kumananchavadi',
  location_subtitle text,
  business_name text not null default 'Shalom Enterprises',
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  pincode text,
  country text not null default 'India',
  map_url text,
  latitude double precision,
  longitude double precision,
  contact_number text,
  opening_hours text not null default 'Monday – Sunday: 9:00 AM – 9:00 PM',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clinic_settings enable row level security;

drop policy if exists "public can read clinic settings" on public.clinic_settings;
create policy "public can read clinic settings"
  on public.clinic_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admins can manage clinic settings" on public.clinic_settings;
create policy "admins can manage clinic settings"
  on public.clinic_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.clinic_settings to anon;
grant select, insert, update, delete on public.clinic_settings to authenticated;

create or replace function public.set_clinic_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clinic_settings_set_updated_at on public.clinic_settings;
create trigger clinic_settings_set_updated_at
  before insert or update on public.clinic_settings
  for each row
  execute function public.set_clinic_settings_updated_at();

-- Seed a single row if none exists. This keeps the live site working even
-- before the admin has entered custom clinic details.
insert into public.clinic_settings (
  clinic_name,
  location_heading,
  location_subtitle,
  business_name,
  address_line_1,
  address_line_2,
  city,
  state,
  pincode,
  country,
  map_url,
  latitude,
  longitude,
  contact_number,
  opening_hours
)
select
  'SPM Dental Care',
  'Find us in Kumananchavadi',
  'Located in Shalom Enterprises',
  'Shalom Enterprises',
  '24W8+428, Trunk Rd, MSS Nagar,',
  'Kumananchavadi, Poonamallee, Kattupakkam,',
  'Chennai',
  'Tamil Nadu',
  '600056',
  'India',
  'https://maps.app.goo.gl/EwTgAWer4MD6tK6EA',
  13.0499,
  80.1628,
  '8838524738',
  'Monday – Sunday: 9:00 AM – 9:00 PM'
where not exists (select 1 from public.clinic_settings);

-- ============================================================================
-- 3. Gallery images table
-- ============================================================================
create table if not exists public.clinic_gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  storage_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clinic_gallery enable row level security;

drop policy if exists "public can read clinic gallery" on public.clinic_gallery;
create policy "public can read clinic gallery"
  on public.clinic_gallery
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "admins can manage clinic gallery" on public.clinic_gallery;
create policy "admins can manage clinic gallery"
  on public.clinic_gallery
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.clinic_gallery to anon;
grant select, insert, update, delete on public.clinic_gallery to authenticated;

create or replace function public.set_clinic_gallery_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clinic_gallery_set_updated_at on public.clinic_gallery;
create trigger clinic_gallery_set_updated_at
  before insert or update on public.clinic_gallery
  for each row
  execute function public.set_clinic_gallery_updated_at();

-- The site should not silently hide the existing real clinic photography if it
-- already exists in the bucket. Seed nothing here by default because the admin
-- can upload the actual clinic photos after running this migration.

-- ============================================================================
-- 4. Storage policies for the gallery bucket
-- ============================================================================
-- Allow public read access to the gallery bucket; admin-only writes. The
-- object path itself is kept in public.clinic_gallery.image_url, while the
-- bucket remains public so the site loads images without signed URLs.

create policy if not exists "public can read clinic gallery objects"
  on storage.objects
  for select
  to public
  using (bucket_id = 'clinic-gallery');

create policy if not exists "admins can upload clinic gallery objects"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'clinic-gallery' and public.is_admin());

create policy if not exists "admins can update clinic gallery objects"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'clinic-gallery' and public.is_admin())
  with check (bucket_id = 'clinic-gallery' and public.is_admin());

create policy if not exists "admins can delete clinic gallery objects"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'clinic-gallery' and public.is_admin());
