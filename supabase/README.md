# Admin Dashboard — Supabase Setup

1. **Run the SQL.** Open the Supabase Dashboard → SQL Editor → New query,
   paste in the full contents of `admin_dashboard.sql`, and run it. It's
   idempotent, so re-running it later (e.g. after pulling new code) is safe.

2. **Check for stray old policies.** Section 5 of that file has a query to
   list every policy currently on `public.appointments`. If anything from
   earlier prototyping grants public/anon SELECT, UPDATE, or DELETE, drop it
   — otherwise it stays active alongside the new admin-only policies.

3. **Create your first admin.** Section 6 of that file walks through it:
   create a user under Authentication → Users, then insert their user id
   into `public.admins`. Nothing in the app itself can create an admin —
   that's intentional.

4. **No new environment variables needed.** The admin dashboard reuses the
   existing `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `.env.local`. The
   secret/service_role key is never used anywhere in this app.

5. **Install the new dependency and run locally:**
   ```
   npm install
   npm run dev
   ```
   Then visit `/admin/login`.

6. **If a valid admin gets "not authorized" after signing in**, run
   `fix_admin_authorization.sql` — this addresses a table-grant issue in
   the original `admin_dashboard.sql`. The app code now checks admin
   status via the `is_admin()` function rather than querying
   `public.admins` directly, which sidesteps the issue going forward.

7. **Manual appointments + Recently Deleted / Bin.** Run
   `admin_archive_and_manual_appointments.sql` once, after step 1 above.
   It only adds an `archived_at` column (and a supporting index) to
   `public.appointments` — no new table, no RLS policy changes — and is
   required before the "+ New Appointment" button and "Recently Deleted"
   Bin will work. See the comments at the top of that file for details.
