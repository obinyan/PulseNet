# PulseNet web

Next.js (App Router, TypeScript). Run: `npm install` then `npm run dev`, open http://localhost:3000.

Routes: `/login`, `/signup`, `/dashboard` (overview), `/dashboard/[routers|plans|vouchers|sessions|customers|payments|agents|reports|settings]` (all pages built; Settings has Business profile and Staff and roles, the other settings sections are marked as not built).
Login and signup currently just go to the dashboard. Real auth comes next. Routers, plans and vouchers are stored in your browser (localStorage) for front-end testing; all figures start at 0. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_RADIUS_HOST`.

## Customer login page and admin panel
- Customer login page: `/portal/<router id>` (or `/portal/preview` to preview branding). Open it from Routers (Login page link) or Settings, Branding and logo. Test mode: voucher login is simulated.
- Super admin panel: `/admin` (Overview, Operators, Subscription plans). No admin login yet. Operators appear when someone uses the Sign up form.
