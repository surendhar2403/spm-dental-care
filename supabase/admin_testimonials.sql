-- Create testimonials table for admin-managed patient reviews
-- Run this file once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Idempotent: safe to re-run.

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  review_text text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  source text not null default 'Google',
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep active/public ordering stable and predictable.
create index if not exists testimonials_active_sort_order_idx
  on public.testimonials (is_active, sort_order, created_at);

-- Trigger to keep updated_at current on modifications
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.testimonials;
create trigger set_updated_at
  before update on public.testimonials
  for each row
  execute procedure public.set_updated_at();

alter table public.testimonials enable row level security;

-- Public (anon) may read active testimonials only.
drop policy if exists "public can select active testimonials" on public.testimonials;
create policy "public can select active testimonials"
  on public.testimonials
  for select
  to anon
  using (is_active = true);

-- Admins can select all testimonials.
drop policy if exists "admins can select testimonials" on public.testimonials;
create policy "admins can select testimonials"
  on public.testimonials
  for select
  to authenticated
  using (public.is_admin());

-- Admins can insert testimonials.
drop policy if exists "admins can insert testimonials" on public.testimonials;
create policy "admins can insert testimonials"
  on public.testimonials
  for insert
  to authenticated
  with check (public.is_admin());

-- Admins can update testimonials.
drop policy if exists "admins can update testimonials" on public.testimonials;
create policy "admins can update testimonials"
  on public.testimonials
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete testimonials.
drop policy if exists "admins can delete testimonials" on public.testimonials;
create policy "admins can delete testimonials"
  on public.testimonials
  for delete
  to authenticated
  using (public.is_admin());

-- Grants
grant select on public.testimonials to anon;
grant select on public.testimonials to authenticated;
