# SPM Dental Care

Marketing website for SPM Dental Care in Kumananchavadi, Chennai. Real clinic
details (dentist, phone, address, hours, treatments, Google rating) are wired
in; the logo and clinic photos are still placeholders pending real files.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- ESLint (flat config)
- Supabase (planned, not yet integrated)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint     # run ESLint
```

## Project structure

```
src/
  app/
    layout.tsx      # root layout: fonts, metadata, Header/Footer, structured data
    page.tsx         # homepage — composes all sections
    globals.css      # Tailwind import + design tokens (@theme)
    sitemap.ts       # generates /sitemap.xml
  components/
    layout/          # Header, Footer
    sections/        # Hero, About, Treatments, WhyChooseUs, Dentist,
                      # GoogleReviews, Gallery, LocationHours, AppointmentCTA,
                      # AppointmentForm
    ui/               # Container, Button, SectionHeading, SmileDivider
    StructuredData.tsx  # Dentist/LocalBusiness JSON-LD
  lib/
    constants.ts     # real clinic content — the single source of truth
    utils.ts         # buildWhatsAppUrl helper
  types/
    index.ts         # shared TypeScript interfaces
```

## Content

`src/lib/constants.ts` holds every real detail supplied so far: clinic name,
Dr. Saji (BDS), phone/WhatsApp, the Google Maps address, opening hours, the
15 treatments (grouped), and the Google rating (4.9 / 14 reviews).

Nothing invented has been added anywhere — no fabricated years of experience,
awards, specialties, review text, or patient counts. Where information wasn't
provided (a dentist bio, an email address), the corresponding UI simply
omits it rather than making something up.

## About section

The About section (`About.tsx`) is a full-bleed, split-screen editorial
layout: a real dental-treatment photo on one side, a bold condensed heading
("PATIENT-FOCUSED DENTAL CARE IN KUMANANCHAVADI", using the same Oswald
`font-hero` treatment as the Hero) and the clinic's verified description on
the other, with a "Learn More →" link down to Treatments.

**Provenance note:** `about-dental-treatment.jpg` was supplied as a
"professional dental treatment image," but its filename
(`pexels-holoshuriken-...`) is Pexels' own naming convention, and it carries
the same photo-agency EXIF tag as the earlier hero images — it's stock
photography, not a real SPM Dental Care photo. Same caveat as the hero
slider images: wired in as requested, but `clinic-reception.jpg`,
`clinic-room.jpg`, and `dental-chair.jpg` remain the real, verified option.

## Hero/Header width

`Container` now has a `size` prop (`"default"` | `"wide"`). Every regular
section still uses the default 1152px-max-width container; the Header and
Hero use `size="wide"` (1440px max-width, slightly tighter large-screen
padding) so their content shares one consistent left edge and uses more of
the viewport on large screens, without touching the rest of the site.

## A real overflow bug (found and fixed during verification)

While checking the About section on narrow viewports, "Kumananchavadi" (a
14-character unbroken word in the bold condensed heading) was found to
genuinely overflow horizontally — not just look tight. Root cause: a classic
CSS Grid gotcha. `About.tsx`'s layout used a bare `grid` class on mobile,
which has no explicit `grid-template-columns` — an implicit grid track can
grow to fit unshrinkable content instead of clamping to the viewport, which
silently defeats `break-words`. This was confirmed by directly measuring the
DOM (`grid-template-columns` was resolving to 453px inside a 320px
viewport). Fixed by using explicit `grid-cols-1 lg:grid-cols-2` — Tailwind
compiles `grid-cols-*` to `minmax(0, 1fr)`, which correctly clamps the track
to the container. Verified after the fix that the same measurement resolves
to exactly 320px, and confirmed visually that the word now wraps mid-word
("KUMANANCHAVA / DI") instead of clipping, at viewports as narrow as 320px.

As a defensive measure, the same `grid-cols-1` fix was applied to every
other bare `grid` usage in the codebase (WhyChooseUs, Treatments, Gallery,
Footer, AppointmentForm) — same latent bug class, low risk, no visual
change unless it was about to overflow anyway. `break-words` was also added
to both the Hero and About headlines as a second layer of defense.

## Header

The header (`Header.tsx`) is a **fixed, scroll-aware overlay**, not a
sticky bar that reserves its own space:

- At the top of the page it's transparent, with a subtle top-down dark
  gradient of its own (independent of the hero slider's overlay) so the
  larger logo and bold "SPM DENTAL CARE" wordmark stay readable over any
  hero photo.
- Past ~24px of scroll, it switches to a solid `bg-canvas/95` background
  with dark text/nav, so it stays legible over the lighter sections below
  the hero.
- The logo now uses `logo-transparent.png` — the same artwork as
  `logo.png`, but with the white background keyed out (alpha channel added
  by thresholding on how close each pixel is to pure white), so it sits
  cleanly on both the dark hero and the light header state with no white
  box around it. `logo.png` (opaque) is kept for the Footer's white-chip
  treatment, which still works well on the solid navy footer.
- Because the header is `fixed` (removed from normal document flow) rather
  than `sticky`, the Hero section's top padding was increased so its
  content doesn't sit under the floating header, and `scroll-padding-top`
  was added globally so in-page nav links (`#about`, `#appointment-form`,
  etc.) don't land with their heading hidden behind the header.

## Hero slider

The Hero headline uses Oswald (a bold, condensed Google Font) exclusively for
that one oversized display line — every other heading on the site still uses
Fraunces, the site's regular serif. This gives the hero editorial impact
(large, condensed, uppercase) without changing the typographic voice
anywhere else.

The Hero section (`Hero.tsx` + `HeroSlider.tsx`) is a full-bleed, auto-advancing
image slider: 4 images crossfade every 5 seconds (1000ms transition), with
clickable dot indicators, and it respects `prefers-reduced-motion` by
stopping auto-rotation and skipping the fade entirely.

**Provenance note:** the 4 slider images (`hero-1.jpg`–`hero-4.jpg`) were
supplied as "professional dental images," but their EXIF metadata carries a
photo-agency copyright tag and the staff/patients/settings shown don't match
SPM Dental Care's own clinic or Dr. Saji — they read as stock photography.
This conflicts with the "no stock images" requirement set earlier in this
project. They're wired in as requested, but should ideally be replaced with
real SPM Dental Care photography (see `clinic-reception.jpg`, `clinic-room.jpg`,
`dental-chair.jpg`, which are genuine clinic photos already used elsewhere on
the site).

## Images

Real clinic images are in `public/images/`:

- `logo.png` — used in the Header and Footer
- `clinic-reception.jpg` — used in the About section and Gallery
- `clinic-room.jpg` — used in the Hero section and Gallery
- `dental-chair.jpg` — used in the Dentist section and Gallery

All are rendered with `next/image`, with either explicit `width`/`height`
(the two logo instances) or `fill` + `sizes` inside a sized, `relative`
parent (the four photo instances), so there's no layout shift while they
load. Each has specific, descriptive `alt` text.

No individual photo of Dr. Saji was provided, so the Dentist section uses a
real treatment-room photo rather than a placeholder or a stock headshot —
swap it for an actual photo of Dr. Saji whenever one is available.

Source files were re-encoded on the way in (EXIF stripped, resized to a
1600px max dimension, progressive JPEG at quality 82; the logo converted to
a true 512×512 PNG) to keep page weight down without a visible quality loss.

## Appointment form

The "Request an appointment" form (`AppointmentForm.tsx`) is UI-only: it
collects name, phone, preferred date/time, treatment, and message, then opens
WhatsApp with a prefilled message when submitted. Nothing is stored or sent
to a server. Replace this with a real Supabase-backed booking flow later.

## SEO

- Per-page metadata, canonical URL, and Open Graph tags in `app/layout.tsx`
- Dentist/LocalBusiness JSON-LD in `components/StructuredData.tsx`, built only
  from the real address/phone/hours/rating in `constants.ts`
- `app/sitemap.ts` generates `/sitemap.xml`
- `public/robots.txt` points at the sitemap

`SITE.url` in `constants.ts` is still a placeholder domain
(`https://www.example.com`) — update it once the real domain is live, since
it feeds the canonical URL, Open Graph tags, and sitemap.

## Planned next steps

- A real photo of Dr. Saji for the Dentist section
- Supabase project + schema for treatments, dentist profiles, and appointments
- Wire the appointment form to a real backend instead of WhatsApp-only
- Authentication (patient and/or admin)
- Admin dashboard for managing content and bookings
- Confirm the production domain and update `SITE.url` accordingly
