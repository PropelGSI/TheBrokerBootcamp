# The Broker Bootcamp

Production-ready single-page event site for **Brand Before You Sell**, the first Broker Bootcamp workshop presented by She's That Broker × The Property Geek.

Canonical production URL: [www.thebrokerbootcamp.com](https://www.thebrokerbootcamp.com)

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Shared Supabase inquiries + Airtable submission pipeline
- Vercel hosting

The public app calls the existing `supabase-inquiries-to-airtable` Edge Function in the shared Supabase project. The function writes into the common `inquiries` workflow and forwards each submission to Airtable.

## Local setup

Requirements: Node.js 22 or newer and npm.

1. Copy `.env.example` to `.env.local`.
2. Add your public Supabase project URL and anon key.
3. Install and start the project:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite.

Available commands:

```bash
npm run dev      # local development
npm run build    # TypeScript check + production build
npm run lint     # lint the React/TypeScript app
npm run preview  # preview the production build
```

## Environment variables

### Vercel project variables

Set these in Vercel → Project Settings → Environment Variables. They are public build-time values, so never put a service-role key in a `VITE_` variable.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Shared Supabase project URL (`https://jwteutzqvthyrqtbcgln.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for the shared Supabase project |
| `VITE_ANALYTICS_PROVIDER` | Enables the analytics adapter when a provider bridge is installed; leave empty otherwise |

Apply these public variables to Production, Preview, and Development. Do not copy a service-role key into this project.

## Shared submission pipeline

Both forms call:

```text
https://jwteutzqvthyrqtbcgln.supabase.co/functions/v1/supabase-inquiries-to-airtable
```

The request body uses `mode: "submit_inquiry"` and the same shared inquiry fields as Metro Manila Finds Home and She&apos;s That Broker. Registrations use `entry_type: "registration"` and `inquiry_type: "event_registration"`. Contact questions use `entry_type: "contact_request"` and `inquiry_type: "event_contact"`.

Broker Bootcamp&apos;s `role` and `how_heard` answers are combined into the inquiry `message`. Consent and attribution details are stored in `internal_notes`. All submissions use `event_slug: "brand-before-you-sell-2026"` and `source: "thebrokerbootcamp.com"`.

Before launch, submit one registration and one contact question and confirm that each appears in both Supabase `inquiries` and Airtable with the expected event, source, entry type, and inquiry type.

## Vercel deployment

1. Set the production branch name and push this repository to GitHub:

   ```bash
   git branch -M main
   git push -u origin main
   ```
2. Import the GitHub repository into Vercel.
3. Use the default Vite framework settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Add the Vercel environment variables listed above.
5. Use `main` as the production branch. Pull requests and other branches will receive preview deployments.
6. Add `www.thebrokerbootcamp.com` and `thebrokerbootcamp.com` under Vercel → Project Settings → Domains.
7. Make `www.thebrokerbootcamp.com` the primary domain and configure the apex domain to redirect permanently to `www` in the Vercel domain settings.
8. Add only the DNS records Vercel requests for the website. **Do not modify or remove existing Google Workspace MX, SPF, DKIM, DMARC, or domain-verification records.**

A `vercel.json` is not required for this single-route static Vite app. Domain canonicalization is handled in Vercel's domain settings, where the apex-to-`www` redirect is explicit and easy to audit.

## Analytics

`src/lib/analytics.ts` exposes a small provider-neutral event layer and dispatches a `brokerbootcamp:analytics` browser event for:

- `hero_register_click`
- `header_register_click`
- `mobile_sticky_register_click`
- `ask_question_click`
- `registration_form_start`
- `registration_success`
- `registration_error`
- `contact_form_start`
- `contact_success`
- `contact_error`

No third-party analytics script is loaded. To connect Vercel Analytics, Plausible, or another provider later, set `VITE_ANALYTICS_PROVIDER` and attach a `window.brokerBootcampAnalytics(event, properties)` bridge in the provider integration.

## Updating the next event

The visual sections are reusable React components, while event-specific copy currently lives in `src/App.tsx` and the event slug/source constants live in `src/lib/submissions.ts`. For a future event, update those values together.

Do not change the historical `event_slug` for existing rows.

## Asset checklist

- [ ] Replace `/public/images/maiko-williams.jpg` with an approved, licensed portrait (recommended 1600 × 2000 px or larger).
- [ ] Replace `/public/images/jireh-mamaclay.jpg` with an approved, licensed portrait (recommended 1600 × 2000 px or larger).
- [ ] Review and approve `/public/og.svg` for social sharing; export the approved design to `og.png` if a target platform requires raster-only previews, then update the meta tags.
- [ ] Replace `/public/favicon.svg` if an official Broker Bootcamp brand mark becomes available.
- [ ] Compress final portraits to WebP or AVIF where practical, then update both hero and speaker image paths.
- [ ] Confirm portrait alt text still matches the final crop and content.
- [ ] Confirm the final venue before adding a physical `location` to the event structured data.

The UI intentionally shows designed initials-based speaker placeholders until the two named portrait files exist; it never fetches random stock portraits.

## Launch QA checklist

### Content and business rules

- [ ] Confirm event date and time: September 19, 2026, 3:00 PM–6:00 PM.
- [ ] Confirm the venue remains “To Be Announced” or update all page references together.
- [ ] Confirm ticket language after pricing and seat-allocation rules are approved.
- [ ] Confirm speaker bios and approved portrait usage.
- [ ] Confirm no success message implies a guaranteed seat.

### Responsive and accessibility

- [ ] Test at 375, 430, 768, 1024, 1440, and 1920 px widths.
- [ ] Confirm there is no horizontal overflow or clipped hero text.
- [ ] Test the mobile menu, sticky CTA, every anchor link, and both contact entry points.
- [ ] Complete both forms using only a keyboard.
- [ ] Confirm focus visibility, dialog Escape/close behavior, labels, inline errors, and success announcements.
- [ ] Test with `prefers-reduced-motion: reduce`.
- [ ] Run an automated accessibility scan and manually verify contrast and heading order.

### Forms and security

- [ ] Confirm client and server validation for every required field.
- [ ] Confirm registration creates an `event_registration` inquiry in Supabase and Airtable.
- [ ] Confirm contact creates an `event_contact` inquiry in Supabase and Airtable.
- [ ] Confirm `name`, `email`, `number`, `company`, `message`, `event_slug`, `source`, and entry metadata map correctly.
- [ ] Confirm role/how-heard details appear in the inquiry message and attribution appears in internal notes.
- [ ] Confirm a filled honeypot does not create a submission.
- [ ] Confirm only the public anon key is present in Vercel and the browser bundle.

### SEO and performance

- [ ] Validate title, description, canonical URL, Open Graph preview, Twitter card, favicon, `robots.txt`, and `sitemap.xml`.
- [ ] Validate the JSON-LD event markup; do not add a physical location before confirmation.
- [ ] Run Lighthouse on the production deployment and review Core Web Vitals.
- [ ] Confirm final portrait dimensions prevent layout shift and below-the-fold images lazy-load.
- [ ] Check the production response, custom-domain redirect, HTTPS, and cache behavior.

## Genuine launch TODOs

Only three pieces of business information are deliberately left unresolved: approved speaker portrait files, the confirmed venue, and final ticket/seat-allocation details. The site avoids inventing any of them.
