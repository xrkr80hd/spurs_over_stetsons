# Spurs Over Stetsons

Production Next.js application for the public dance-hall website and class operations system.

## What is implemented

- Public Home, Classes, Schedule, Instructors, Media, and About pages
- Supabase email/password Auth with persistent SSR cookies
- `master_admin`, `manager`, `instructor`, and `student` roles enforced by RLS
- Instructor availability, class types, scheduling, publishing, cancellations, rosters, waitlists, attendance, users, and media
- Atomic registration with capacity checks, duplicate prevention, automatic waitlisting, and waitlist promotion
- Instructor double-book prevention and availability validation in PostgreSQL
- Resend email and Twilio SMS adapters that report unconfigured or failed providers honestly
- Communication history, SMS consent, Supabase Storage media, auditing, and payment-ready records

## Local setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and add project values.
3. Run `npx supabase link --project-ref YOUR_PROJECT_REF`.
4. Run `npx supabase db push`.
5. Run `npm run dev`.

## Supabase setup

Apply every file in `supabase/migrations`. The migration creates schema objects, constraints, RPC functions, RLS policies, indexes, and the public `media` Storage bucket.

After the first account signs up, promote it once in the Supabase SQL editor:

```sql
insert into public.user_roles (user_id, role)
select id, 'master_admin'::public.app_role
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict do nothing;
```

Refresh the session after promotion. Master admins can then invite managers, instructors, and students from the Users dashboard. New accounts receive the student role automatically; instructor invitations also create instructor records.

Set the Auth Site URL to the deployed origin and add `/auth/callback` to allowed redirect URLs.

## Provider setup

- Resend: set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, then verify the sending domain.
- Twilio: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`; point `TWILIO_STATUS_CALLBACK_URL` to `/api/twilio/status` and `TWILIO_INBOUND_URL` to `/api/twilio/inbound` for STOP/START tracking.
- Stripe: the schema protects payment amount/status, but checkout is intentionally disabled until requirements and credentials are supplied.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

With Docker available, also run `npx supabase start`, `npx supabase db reset`, and `npx supabase db lint`.

## Security

- Secrets are server-only and never use a `NEXT_PUBLIC_` prefix.
- Students cannot update registrations or financial fields directly.
- Instructor roster access is limited to assigned sessions; non-staff financial changes are rejected by a database trigger.
- Atomic registration locks the session row, preventing concurrent capacity overflow.
- No roles, sessions, or business records use localStorage.

## Instructor media management

Staff sign in at `/admin` and land at `/dashboard/instructors`. Each named accordion supports photo upload, biography editing, display order, visibility, and confirmed deletion. Public cards do not require an Auth account. Existing instructors retain their original photographs and crop settings; new photos preserve their full frame. Uploads accept JPG, PNG, and WebP up to 4 MB in the public `instructor-photos` bucket; writes require manager or master admin permissions. Deletion of an instructor assigned to classes is blocked until reassignment; hiding remains available.

The homepage reads visible instructor records on each request. Successful mutations refresh both the manager and homepage. During a database outage only, the original instructor list is used as a continuity fallback.

The previously empty hosted database was initialized from the existing backend schema in two stages (`initialize_instructor_backend`, `initialize_existing_backend_tables`), followed by instructor media, access corrections and signup intake. Their combined schema corresponds to the repository's original production migration plus subsequent migrations. Reconcile hosted migration history before using `supabase db push` on this existing project; fresh projects can apply repository migrations in order.

## eBallroom calendar booking handoff

The public calendar is populated by eBallroom's read-only upcoming-classes API.
Class selection now includes the eBallroom numeric class ID and preserves the
displayed date and time on the site's booking page.

To enable one-click handoff for a particular class, set the **server-only**
`EBALLROOM_CLASS_BOOKING_LINKS_JSON` environment variable to a JSON object
mapping the numeric eBallroom class ID to its **real, studio-provided**
`https://my.e-ballroom.com/...` class-specific booking URL. Example structure:
`{"12345":"https://my.e-ballroom.com/YOUR_VERIFIED_CLASS_BOOKING_LINK"}`
(The value shown is an illustrative placeholder, not a working checkout link.)

The booking page redirects immediately to the mapped class link when set.
eBallroom controls the login session, registration and payments. No credentials
are transmitted by this website.

**Integration limitation:** The publicly documented eBallroom calendar API
exposes class IDs but not deep links, customer authentication or a class
registration/checkout endpoint. eBallroom documents direct sales-item links
that continue through login to purchase, but a package purchase alone does
**not** prove the customer has joined the exact class. Until the studio
supplies and verifies a supported class-specific link, the booking page
honestly shows eBallroom login and registration links without claiming to
reserve seats or automatically continue into payment. Do not substitute
a sales-item URL for a class reservation link unless the studio confirms
its workflow. Class links must be updated for new eBallroom class IDs.
