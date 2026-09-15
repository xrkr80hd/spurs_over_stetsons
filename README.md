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
