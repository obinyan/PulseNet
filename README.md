# PulseNet web

Next.js App Router application. Install dependencies with `pnpm install`, then run `pnpm dev` and open http://localhost:3000.

## Supabase Auth setup

1. Copy `.env.example` to `.env.local` and set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `APP_URL` (`http://localhost:3000` locally). These names deliberately omit `NEXT_PUBLIC_`; the key is read by server routes and middleware, not bundled into browser JavaScript. Do not use a Supabase secret/service-role key here.
2. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to Vercel under Project Settings > Environment Variables for Production, Preview, and Development. Set `APP_URL` to the deployed app origin for Production and redeploy.
3. In Supabase Auth, enable email/password sign-in, operator sign-up, and **Confirm email**. Add the deployed site's `/auth/callback` URL to the allowed redirect URLs. The callback returns users to `/login` after they confirm their email.
4. Run the matching Supabase schema/migration first. The signup trigger reads `business_name`, `full_name`, and `phone` metadata to create the operator and owner profile.

Operators create accounts at `/signup` with business name, full name, email, and password. They are sent to `/login` after signup and must confirm their email before signing in. Confirmation links use `APP_URL`. Authentication requests go through same-origin server routes to Supabase Auth; access is checked against `public.profiles`. Super admins sign in at `/admin`. The app sends each role to its appropriate dashboard and protects those routes on the server.

Admin accounts are created in Supabase Authentication with an email and password, then promoted using the trusted SQL instructions in the schema folder. Multiple admins are supported by `public.profiles`: filter `role = super_admin` and `status = active` in Supabase Table Editor to see active super admins. A separate admin table would duplicate profile data, so the shared profiles table is the source of truth.

## Current data scope

Supabase Auth and profile creation are connected. The business dashboards still use the local browser test store for routers, plans, vouchers, and related data; connecting those features to their Supabase tables is a separate integration task. Sign-in is maintained with an HttpOnly session cookie; passwords and the Supabase key are handled by server routes and are not stored in localStorage. Supabase sends confirmation emails while Confirm email is enabled. To use your own sender name and branding, configure custom SMTP and edit the Supabase Auth email template.

## Routes

- `/login`, `/signup`: operator email/password authentication
- `/admin`: super-admin sign-in and admin dashboard
- `/dashboard`: operator dashboard
- `/portal/<router id>`: customer hotspot login preview
