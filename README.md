# PulseNet web

Next.js (App Router, TypeScript). Run: `npm install` then `npm run dev`, open http://localhost:3000.

Routes: `/login`, `/signup`, `/dashboard` (overview), `/dashboard/[routers|plans|vouchers|sessions|customers|payments|agents|reports|settings]` (all pages built; Settings has Business profile and Staff and roles, the other settings sections are marked as not built).
Login and signup currently just go to the dashboard. Real auth comes next. Routers, plans and vouchers are stored in your browser (localStorage) for front-end testing; all figures start at 0. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_RADIUS_HOST`.
