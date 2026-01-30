# BoostCart — Deployment Status

> **Deployed:** January 30, 2026
> **Infra Wired:** January 30, 2026
> **Status:** ✅ FULLY OPERATIONAL — Database provisioned, BigCommerce credentials set, deployed to production

---

## What's Live

| Component | Status | URL |
|-----------|--------|-----|
| **Production App** | ✅ Deployed | https://boostcart.vercel.app |
| **GitHub Repo** | ✅ Created | https://github.com/jguidroz-hub/boostcart |
| **Vercel Project** | ✅ Linked | greenbelt/boostcart |
| **Landing Page** | ✅ Rendering | https://boostcart.vercel.app |
| **Dashboard** | ✅ Rendering | https://boostcart.vercel.app/dashboard |
| **API Routes** | ✅ 8 routes deployed | /api/auth/*, /api/offers, /api/widget/*, /api/analytics |
| **Storefront Widget** | ✅ Served | https://boostcart.vercel.app/widget.js |

## What's Deployed (Code)

- **24 TypeScript files** — full MVP codebase
- **Landing page** with pricing, features, how-it-works
- **Merchant dashboard** with real-time analytics, charts (Recharts)
- **Offer CRUD** — create/edit/delete upsell offers with targeting rules
- **BigCommerce OAuth** — install, load, uninstall, callback endpoints
- **Widget API** — offer matching, acceptance, event tracking
- **Storefront widget** — vanilla JS (< 15KB), self-contained with scoped CSS
- **Prisma schema** — Store, Offer, UpsellEvent models

---

## Infrastructure (Completed Jan 30, 2026)

### ✅ Database — Neon PostgreSQL
- **Database:** `boostcart` on the shared Greenbelt Neon project
- **Host:** `ep-ancient-sea-aehga5e5.c-2.us-east-2.aws.neon.tech`
- **Schema pushed:** Store, Offer, UpsellEvent tables created via `prisma db push`

### ✅ BigCommerce App Registered
- **Client ID:** `6lccc4tas1k19rx8pjs9dendbn6u1xc`
- **Account UUID:** `a33729c6-655c-4690-90df-8147510eedbb`
- Callback URLs configured in Dev Portal:
  - Auth: `https://boostcart.vercel.app/api/auth/install`
  - Load: `https://boostcart.vercel.app/api/auth/load`
  - Uninstall: `https://boostcart.vercel.app/api/auth/uninstall`

### 💳 Stripe (Future — Not Required for MVP)
No Stripe integration exists in the current codebase. The app uses BigCommerce's own payment APIs for upsell order processing. Stripe would only be needed if you add subscription billing for the app itself (charging merchants the $29-99/mo SaaS fee).

---

## Current Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `DATABASE_URL` | ✅ Set | Neon PostgreSQL — `boostcart` database on shared Greenbelt project |
| `APP_URL` | ✅ Set | `https://boostcart.vercel.app` |
| `BC_CLIENT_ID` | ✅ Set | BigCommerce Dev Portal app credentials |
| `BC_CLIENT_SECRET` | ✅ Set | BigCommerce Dev Portal app credentials |
| `BC_ACCOUNT_UUID` | ✅ Set | `a33729c6-655c-4690-90df-8147510eedbb` |
| `WEBHOOK_SECRET` | ✅ Set | Auto-generated secure 64-char hex string |
| `JWT_SECRET` | ✅ Set | Auto-generated secure 64-char hex string |

---

## Architecture

```
Vercel (Next.js 14)
├── Static Pages: /, /dashboard, /offers, /offers/new, /analytics
├── Dynamic API Routes:
│   ├── /api/auth/install     — BC OAuth install
│   ├── /api/auth/load        — BC load callback
│   ├── /api/auth/uninstall   — BC uninstall callback
│   ├── /api/auth/callback    — BC OAuth callback
│   ├── /api/offers           — CRUD (GET/POST/PUT/DELETE)
│   ├── /api/analytics        — Dashboard analytics
│   ├── /api/widget/offer     — Offer matching for storefront
│   ├── /api/widget/accept    — Process upsell acceptance
│   └── /api/widget/event     — Track widget events
├── Public:
│   └── widget.js             — Storefront injection script
└── Prisma Schema: Store, Offer, UpsellEvent
```

---

## Quick Commands

```bash
cd /Users/secondbrain/clawd/ventures/bigcommerce-upsell/app

# Local dev
cp .env.example .env.local  # fill in real values
npm run dev

# Database
npx prisma db push      # Push schema to DB
npx prisma studio        # Visual DB browser

# Deploy
vercel deploy --prod     # Production deploy
vercel logs              # View production logs

# Git
git add -A && git commit -m "update" && git push
```
