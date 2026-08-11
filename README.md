# Debbyfield Schools — Website & Operational System

This repo hosts two things on one Vercel project:

- **Public website** (`/`) — `index.html`, `about.html`, `academics.html`, `admissions.html`, `gallery.html`, `news.html`, `contact.html`, sharing `site.css` / `site.js`
- **Staff Operational System** (`/portal`) — `portal/index.html`, the result-entry, report card, finance, attendance, timetable and admin system

## Public website

A 7-page site (Home, About, Academics, Admissions, Gallery, News & Events, Contact) built as static HTML/CSS sharing `site.css` and `site.js`. News, gallery photos and contact-form messages are stored in Supabase (`site_news`, `site_gallery`, `site_messages` — see `supabase-setup.sql`) and managed by staff from the **Website** section inside the Operational System (`/portal`).

A "Staff Portal" link in the website's nav and footer leads to `/portal`.

## Operational System (`/portal`)

- Teachers open their class, find a student, and enter CA (out of 40) and Exam (out of 60) scores per subject
- EDGE Character Observation field for each student
- Attendance tracking per student
- One-click printable report card with grade key, character section, and signature lines
- Send results to parents by PDF download, print, or directly to WhatsApp
- Timetable auto-generation with teacher-availability and subject-priority constraints
- All data saves automatically in the browser (localStorage) and syncs with Supabase

## Access control

Staff sections require signing in with a role PIN (Director / Head of Operations / Owner / Office Admin). The PIN itself is only ever checked server-side, in `api/auth-pin.js` — the browser never holds a PIN hash. On a correct PIN, that endpoint signs the role into a real Supabase Auth session, and the database's row-level security policies (see the "SECURITY HARDENING" block at the end of `supabase-setup.sql`) require that session for every staff-only table. Signing in is what grants real data access, not just what unlocks the UI.

## Hosting on Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import the repo
3. No build settings needed — deploy as-is (`vercel.json` routes `/portal/*` to the operational system and clean URLs like `/about` to their `.html` files)
4. In Vercel → Project → Settings → Environment Variables, add `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard → Settings → API → `service_role` key — keep this secret, never put it in this repo or the browser)
5. Run the SQL in `supabase-setup.sql` in the Supabase SQL editor (safe to re-run — every statement is idempotent)
6. Share the root URL for the public website, and `/portal` with staff

## Term / session

Currently set to **Third Term 2025/2026**. To change, edit `TERM` and `SESSION` at the top of `portal/index.html`.
