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

4. **Environment variables.** The admin dashboard reuses the existing
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from
   `.env.local`. Revenue protection additionally requires the server-only
   `REVENUE_ACCESS_SESSION_SECRET` from `.env.local`; the secret/service_role
   key is never used anywhere in this app.

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

8. **Doctors, Treatments, and No Show status.** Run
   `admin_doctors_treatments_noshow.sql` once, after step 1 above (order
   relative to step 7 doesn't matter). It creates two new tables —
   `public.doctors` and `public.treatments` — seeded with the clinic's
   existing doctors/treatments so "Manage Doctors" and "Manage Treatments"
   in the dashboard aren't empty on first use, and widens
   `public.appointments.status` to also allow `'no_show'` (used by the
   "Mark No Show" action). No existing table, column, or row is dropped,
   renamed, or modified. Required before "Manage Doctors", "Manage
   Treatments", and "Mark No Show" will work — without it those features
   will show a load/save error banner rather than breaking anything else.

9. **If "Manage Doctors" / "Manage Treatments" still show a "Couldn't
   load" error after step 8**, open the modal and check your browser's
   console — the real Supabase error is now logged there and shown
   directly in the modal, not hidden behind a generic message. If it says
   `permission denied for table doctors` (or `treatments`), run
   `fix_doctors_treatments_access.sql` — this is the same table-grant
   issue already documented for `public.admins` in
   `fix_admin_authorization.sql`, just on these two newer tables. If it
   says the relation `does not exist`, step 8 hasn't actually been run
   against this project yet — run `admin_doctors_treatments_noshow.sql`
   first.

10. **Public website treatment dropdown.** Run
    `public_treatments_read_access.sql` once, after step 8 above. The
    PUBLIC appointment form's treatment dropdown reads `public.treatments`
    directly (active treatments only), but the table's only SELECT policy
    from step 8 is admin-only (`to authenticated`) — the public site runs
    as the `anon` role, which had no access at all. This file adds a
    second, narrower SELECT policy + grant that lets anonymous visitors
    read active treatments only; it does not change admin access,
    `public.appointments`, or any existing row. Required before the
    public "Book Appointment" form's treatment dropdown will populate —
    without it, the dropdown shows a "Treatments unavailable" error
    state instead of silently falling back to a hardcoded list. Open your
    browser's console on the public site if the dropdown shows that error
    to see the exact Supabase error.

11. **Public website "Our Dental Specialists" section.** Run
    `public_doctors_read_access.sql` once, after step 8 above. The PUBLIC
    site's doctor grid reads `public.doctors` directly (active doctors
    only), but the table's only SELECT policy from step 8 is admin-only
    (`to authenticated`) — the public site runs as the `anon` role, which
    had no access at all. This file adds a second, narrower SELECT policy
    + grant that lets anonymous visitors read active doctors only; it
    does not change admin access, appointment logic, or any existing row.
    Required before the public "Our Dental Specialists" section will
    populate — without it, the section shows a "couldn't load" error
    state instead of silently falling back to a hardcoded list. Open your
    browser's console on the public site if the section shows that error
    to see the exact Supabase error.

12. **Treatment pricing and visibility.** Run `treatment_pricing.sql` after
   step 10. It adds the nullable numeric `price` column to the existing
   `public.treatments` table without changing any IDs or rows, refreshes the
   PostgREST schema cache, and includes a verification query. The admin
   Manage Treatments modal then persists numeric prices and `is_active`;
   the public Treatments section displays configured INR prices and only
   active rows. Leave price empty for treatments without a configured amount.

13. **Revenue protection.** Run `revenue_access.sql` after step 1. It creates
    the hash-only Revenue password table and admin-gated RPCs for verification,
    first-time setup, and password changes. The first Revenue password can be
    set from Admin Settings → Security after this migration is applied. Set
    `REVENUE_ACCESS_SESSION_SECRET` in the server environment to a long random
    value; it signs the short-lived HTTP-only Revenue authorization cookie and
    is never exposed to the browser. The existing Supabase Admin Auth session
    and `is_admin()` checks remain required for every Revenue operation.
   If the migration was already run and the app reports that
   `initialize_revenue_password` cannot be found in the schema cache, run
   `revenue_access_initialize_repair.sql` in the Supabase SQL Editor. This
   creates only the missing RPC against the existing hash table, grants its
   authenticated execution permission, and runs `notify pgrst, 'reload
   schema';` before you refresh the dashboard.

14. **Revenue login verification repair.** If a Revenue password was saved
   successfully but the same password is rejected, run
   `revenue_access_verify_repair.sql`. It recreates only the existing
   `verify_revenue_password(text)` RPC with bcrypt verification against
   `public.revenue_access_settings.password_hash`, grants authenticated
   execution, and reloads the PostgREST schema cache.

15. **Revenue password change repair.** If Settings → Security reports that
   `change_revenue_password` is missing, run
   `revenue_access_change_repair.sql`. It verifies the current bcrypt hash,
   rejects reusing the same password, updates the existing row only, grants
   authenticated execution, and reloads the PostgREST schema cache.

16. **Revenue password existence check.** If the Security modal reports
   `permission denied for table revenue_access_settings`, run
   `revenue_access_has_password_repair.sql`. The frontend uses the resulting
   `has_revenue_password()` RPC, which returns only `true` or `false` through
   a `SECURITY DEFINER` function and never exposes the password hash.
