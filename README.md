# PulseNet web

Next.js (App Router, TypeScript). Run: `npm install` then `npm run dev`, open http://localhost:3000.

Routes: `/login`, `/signup`, `/dashboard` (overview), `/dashboard/[routers|plans|vouchers|sessions|customers|payments|agents|reports|settings]` (routers, plans, vouchers and sessions are built; the rest are placeholders).
Login and signup currently just go to the dashboard. Real auth comes next. Routers, plans and vouchers are stored in your browser (localStorage) for front-end testing; all figures start at 0. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_RADIUS_HOST`.
