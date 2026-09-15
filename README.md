# Spurs Over Stetsons

Production rebuild of the Spurs Over Stetsons website and class-management system.

## Source prototype

The approved source prototype is the uploaded `Spurs-Over-Stetsons-Prototype.zip` from the project chat. Treat that ZIP as the workflow/design reference while rebuilding the application for production. The original prototype is a single-browser/localStorage demo and must not be shipped as the production backend.

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
