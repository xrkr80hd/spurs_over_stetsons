# Spurs Over Stetsons

Production rebuild of the Spurs Over Stetsons website and class-management system.

## Source prototype

The approved working prototype is preserved under `/prototype` and should be treated as the workflow/design reference while the application is rebuilt for production.

## Target stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel
- Transactional email provider (Resend preferred unless otherwise configured)
- SMS provider (Twilio preferred unless otherwise configured)

## Production workflow

Instructor Availability → Manager/Admin Scheduling → Published Class → Student Registration → Payment / Notifications → Attendance / Reporting

Do not ship browser-local mock authentication or localStorage as the production data layer.
