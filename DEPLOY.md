# BoostCart — Deployment Status

> **Deployed:** January 30, 2026
> **Status:** ✅ LIVE on Vercel (code deployed, needs DB + BC credentials for full operation)

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

## What Jon Needs to Do (for full launch)

### 1. 🗄️ Provision a PostgreSQL Database
The app needs a Postgres database. Easiest options:

**Option A: Vercel Postgres (recommended — auto-integrates)**
1. Go to https://vercel.com/greenbelt/boostcart/stores
2. Click "Create Database" → "Postgres"
3. Vercel will automatically add the `DATABASE_URL` env var
4. Redeploy: `vercel deploy --prod`

**Option B: Neon.tech (free tier)**
1. Go to https://neon.tech and create a project called "boostcart"
2. Copy the connection string
3. Update env var: `vercel env rm DATABASE_URL production` then `vercel env add DATABASE_URL production`
4. Paste the connection string

**After DB is provisioned:**
```bash
cd /Users/secondbrain/clawd/ventures/bigcommerce-upsell/app
# Set DATABASE_URL in .env.local with the real connection string
npx prisma db push   # Creates the tables
vercel deploy --prod  # Redeploy with real DB
```

### 2. 🛒 Register BigCommerce App
1. Go to https://devtools.bigcommerce.com/my/apps
2. Click "Create an app"
3. App name: **BoostCart**
4. Set these callback URLs:
   - **Auth Callback URL:** `https://boostcart.vercel.app/api/auth/install`
   - **Load Callback URL:** `https://boostcart.vercel.app/api/auth/load`
   - **Uninstall Callback URL:** `https://boostcart.vercel.app/api/auth/uninstall`
5. Required OAuth Scopes:
   - Orders: `modify`
   - Products: `read-only`
   - Content: `modify` (for Scripts API)
   - Checkout Content: `modify`
   - Carts: `modify`
   - Storefront API Tokens: `manage`
   - Customers: `read-only`
   - Information & Settings: `read-only`
6. Copy the **Client ID** and **Client Secret**
7. Update Vercel env vars:
   ```bash
   vercel env rm BC_CLIENT_ID production
   vercel env add BC_CLIENT_ID production  # paste real client ID
   vercel env rm BC_CLIENT_SECRET production
   vercel env add BC_CLIENT_SECRET production  # paste real secret
   vercel deploy --prod
   ```

### 3. 💳 Stripe (Future — Not Required for MVP)
No Stripe integration exists in the current codebase. The app uses BigCommerce's own payment APIs for upsell order processing. Stripe would only be needed if you add subscription billing for the app itself (charging merchants the $29-99/mo SaaS fee).

When ready:
- Create a Stripe account
- Build a billing page with Stripe Checkout
- Add `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` env vars

---

## Current Environment Variables

| Variable | Status | Value |
|----------|--------|-------|
| `DATABASE_URL` | ⚠️ Placeholder | Needs real Postgres connection string |
| `APP_URL` | ✅ Set | `https://boostcart.vercel.app` |
| `BC_CLIENT_ID` | ⚠️ Placeholder | Needs real BigCommerce app client ID |
| `BC_CLIENT_SECRET` | ⚠️ Placeholder | Needs real BigCommerce app client secret |
| `WEBHOOK_SECRET` | ✅ Set | Auto-generated secure hex string |

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
