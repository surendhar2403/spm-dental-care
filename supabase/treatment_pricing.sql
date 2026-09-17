-- SPM Dental Care - treatment pricing and visibility
-- Run after admin_doctors_treatments_noshow.sql and public_treatments_read_access.sql.
-- Existing treatment rows and IDs are preserved.

alter table public.treatments
  add column if not exists price numeric(10, 2);

alter table public.treatments
  alter column is_active set default true;

comment on column public.treatments.price is
  'Optional treatment amount in Indian rupees. NULL means no configured price.';

-- Keep public reads limited to visible treatments. Admin policies from the
-- existing migration continue to control authenticated writes.
drop policy if exists "public can select active treatments" on public.treatments;
create policy "public can select active treatments"
  on public.treatments
  for select
  to anon
  using (is_active = true);

grant select on public.treatments to anon;

-- Ask PostgREST to refresh its schema cache immediately after the ALTER TABLE.
notify pgrst, 'reload schema';

-- Verification: this should return one row with data_type = numeric and
-- is_nullable = YES after the migration has been applied.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'treatments'
  and column_name = 'price';
