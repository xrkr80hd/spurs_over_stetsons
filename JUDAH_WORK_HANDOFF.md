# JUDAH — Spurs Over Stetsons Production Build Handoff

You are taking ownership of the production rebuild of **Spurs Over Stetsons**.

## Source material

Use the uploaded conversation file `Spurs-Over-Stetsons-Prototype.zip` as the canonical prototype/reference. Inspect and extract it before making architectural decisions. The prototype contains a self-contained `index.html` and README files. Preserve the approved visual direction and workflows, but do **not** preserve the browser-local mock architecture.

Repository: `xrkr80hd/spurs_over_stetsons`
Default branch: `main`

The repo is intentionally minimal. Build the real application here and push completed work to `main`. The user will connect/deploy it to Vercel after the production build is pushed.

## Required production stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel-compatible architecture
- Resend for transactional email unless an existing provider is already configured
- Twilio for SMS unless an existing provider is already configured

Do not use localStorage as the production database. Do not keep mock role login. Do not fake successful email, SMS, payment, or database actions.

## Existing prototype inventory

The prototype already demonstrates these concepts and should be translated into production features:

- Public Home, Classes, Schedule, Instructors, Media, About
- Responsive/mobile navigation
- Weekly class calendar
- Master Admin, Manager, Instructor, Student role concepts
- Operations calendar/scheduler
- Instructor CRUD
- Instructor availability CRUD
- Class type CRUD
- Scheduled class/session CRUD
- Registration CRUD
- Payment-status mock
- Announcements
- Media management
- User/role management
- Audit log
- Guided help/tutorial concepts

Prototype data collections currently include instructors, availability, classTypes, sessions, registrations, announcements, mediaEvents, users, and audit records.

## Production roles

Implement authenticated roles with server/database enforcement and Supabase RLS:

1. `master_admin`
   - Full system access
   - Manage managers, instructors, students, roles, classes, settings, communications, audit log

2. `manager`
   - Manage instructors
   - Manage class types
   - Manage instructor availability and scheduling
   - Manage scheduled sessions
   - View/manage class rosters and registrations
   - Send class/customer email and SMS
   - Mark attendance
   - Manage announcements/media as allowed

3. `instructor`
   - See only their own assigned classes
   - Manage/submit their own availability
   - See rosters for their own classes where appropriate
   - Mark attendance if enabled
   - Cannot see or modify unrelated instructor/student administrative data

4. `student`
   - Manage their own profile
   - Browse published classes
   - Register/cancel within business rules
   - See only their own registrations
   - Never edit payment status or payment amount

## Core booking flow

Production flow must be:

`Published Class -> Book -> Student identity/profile -> Email + phone -> SMS consent -> registration validation -> capacity check -> confirmation -> email confirmation -> SMS confirmation/reminders`

Implement:

- Student name
- Email
- Phone
- SMS opt-in/opt-out and consent timestamp
- Registration timestamp
- Registration status
- Unique student/session protection
- Capacity enforcement server-side
- Automatic waitlist when full
- Waitlist promotion workflow when a confirmed registration is cancelled
- Cancellation rules/status
- Attendance status
- Internal notes only where role-appropriate

Students must never be able to set their own payment state or amount.

## Scheduling requirements

Implement real scheduling backed by Postgres:

- Class types
- Instructors
- Instructor availability
- Scheduled sessions/classes
- Start/end times
- Capacity
- Published/draft/cancelled status
- Location/room field
- Price field or pricing reference
- Recurring scheduling support or a structure that can support recurrence cleanly
- Instructor double-book prevention
- Validate scheduled sessions against instructor availability
- Enforce critical conflicts server-side, not only in the UI

## Manager communication center

A manager needs to be able to open a scheduled class and see:

- Instructor
- Date/time
- Capacity
- Confirmed students
- Waitlist
- Attendance
- Paid/unpaid status if payments are enabled
- Email address
- Phone/SMS eligibility

Actions should include:

- Email one student
- Text one student
- Email selected roster members
- Text selected roster members
- Email/text the full eligible roster
- Send cancellation/update notices for a class

All bulk messages must respect SMS consent and unsubscribe/opt-out state. Store communication logs with provider/message status where practical.

## Email/SMS architecture

Create provider-backed server-only utilities. Never expose provider secrets to the client.

Environment variables should be documented in `.env.example`.

Suggested adapters:

- Resend transactional email
- Twilio SMS

If credentials are not present, the application should clearly report that the provider is not configured instead of pretending the message was sent.

## Supabase schema

Create versioned SQL migrations for the production data model. At minimum include tables or equivalent normalized structures for:

- profiles
- user_roles
- instructors
- instructor_availability
- class_types
- class_sessions
- registrations
- waitlist/registration state
- communication_consents
- communication_logs
- announcements
- media_items
- audit_logs

Add indexes, foreign keys, uniqueness constraints, timestamps, and RLS policies.

Do not rely only on client-side filtering for role security.

## Media

Move production uploads to Supabase Storage. Support the existing concept of photos, uploaded/direct video, YouTube links, draft/published/scheduled media, and placeholders where useful.

## Payments

The prototype contains payment state but not real payments. Keep the data model ready for payments. If Stripe credentials/integration requirements are available, implement it cleanly. If not, do not block the primary scheduling/registration build and do not fake a successful checkout.

## Design

Use the prototype as the design anchor: dark western/dance-hall aesthetic, strong readability, responsive desktop/mobile layout. Modernize implementation and polish spacing, hierarchy, forms, tables, calendars, empty states, loading states, errors, accessibility, and mobile behavior without throwing away the recognizable Spurs Over Stetsons identity.

## SEO / discoverability

Public pages should have proper Next.js metadata, titles/descriptions, semantic HTML, sitemap/robots support where appropriate, and crawlable class/instructor content. Keep private dashboards out of search indexing.

## Implementation order

Work autonomously in this order:

1. Inspect prototype and repository.
2. Scaffold production Next.js/TypeScript/Tailwind app.
3. Rebuild public layout/pages from prototype.
4. Add Supabase clients, schema migrations, Auth, role model, and RLS.
5. Build master/manager/instructor/student dashboard shells.
6. Implement instructors, availability, class types, scheduling, conflicts, publishing.
7. Implement student registration, capacity, duplicate prevention, waitlist, cancellations.
8. Implement manager roster/attendance controls.
9. Implement email/SMS adapters and communication UI/logging.
10. Implement media/storage and announcements.
11. Add audit logging for important administrative mutations.
12. Optimize responsive design, accessibility, SEO, loading/error states, and security.
13. Run lint, typecheck, tests/smoke tests, and `next build`.
14. Fix all build-blocking problems.
15. Commit and push the working production source to `main` in `xrkr80hd/spurs_over_stetsons`.

## Quality rules

- Do not ask the user to re-explain the prototype; inspect it.
- Do not stop at a static redesign.
- Do not leave browser-local mock data as the real backend.
- Do not claim something is working unless you tested the relevant flow.
- Preserve working prototype behavior when it is sensible, but fix unsafe prototype shortcuts.
- Use server-side validation for privileged mutations.
- Keep secrets out of Git.
- Add a complete `.env.example`.
- Add a useful README with local setup, Supabase migration/setup, provider configuration, and Vercel deployment requirements.
- Favor a maintainable application over a single giant component/file.

## Required acceptance checks before handoff

Verify at minimum:

- Public pages render on desktop and mobile.
- Auth session persists correctly.
- Role access is enforced, not merely hidden in navigation.
- Manager can create instructor, availability, class type, and scheduled class.
- Published session appears publicly.
- Student can register once.
- Duplicate registration is rejected.
- Capacity cannot be exceeded.
- Full classes route new registrations to waitlist.
- Instructor sees only their relevant data.
- Student sees only their own registrations.
- Student cannot manipulate payment status/amount.
- Manager can view class roster.
- Email/SMS UI respects provider configuration and SMS consent.
- Database RLS prevents obvious cross-role access.
- `npm run lint`, typecheck, and production build pass.

When finished, provide a concise handoff containing the final commit SHA, what is working, migrations/environment variables needed, and any remaining external credentials/services the user must configure before Vercel production deployment.
