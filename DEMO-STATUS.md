# BoostCart — E2E Demo Status

> **Date:** January 30, 2026
> **Status:** ✅ WORKING END-TO-END

---

## What's Working

### 1. ✅ Database (Neon Postgres)
- **Project:** `boostcart` on Neon (Jon's account via GitHub: jguidroz-hub)
- **Region:** AWS US East 1 (N. Virginia)
- **Connection:** Pooled endpoint via `ep-long-shadow-ahpj194c-pooler`
- **Tables:** Store, Offer, UpsellEvent — all created via Prisma

### 2. ✅ BigCommerce Store
- **Store:** BoostCart Demo
- **URL:** https://store-v5haesfq2b.mybigcommerce.com
- **Store Hash:** `v5haesfq2b`
- **Account:** Jguidroz@gmail.com
- **Trial:** 15-day free trial (expires ~Feb 14, 2026)
- **Products:** 13 sample products with images

### 3. ✅ BigCommerce API Integration
- **API Account:** "BoostCart App" (Store-level V2/V3 token)
- **Client ID:** `1z6iuxjd98dnua45dd7ei70t6yb4j1e`
- **Scopes:** Content (modify), Checkout content (modify), Customers (read), Info & settings (read), Orders (modify), Products (read), Carts (modify), Storefront API tokens (manage)
- **Verified:** API calls working — fetches products, images, prices from BC

### 4. ✅ Live App on Vercel
- **URL:** https://boostcart.vercel.app
- **Demo:** https://boostcart.vercel.app/demo.html
- **All env vars set:** DATABASE_URL, APP_URL, BC_CLIENT_ID, BC_CLIENT_SECRET, WEBHOOK_SECRET

### 5. ✅ Widget API Working
- **Endpoint:** `GET /api/widget/offer?storeHash=v5haesfq2b&orderId=1&productIds=77`
- **Returns:** Full offer data with real product details from BigCommerce:
  - Product name, image URL from BC CDN
  - Original price ($109) and discounted price ($92.65)
  - Offer title, description, CTA text, timer settings

### 6. ✅ Demo Offer Created
- **Name:** Post-Purchase Upsell Demo
- **Type:** post_purchase
- **Trigger:** any order
- **Upsell Product:** [Sample] Orbit Terrarium - Large (ID: 80, $109)
- **Discount:** 15% off → $92.65
- **Timer:** 5 minutes countdown

---

## What Needs Human Action (for Full Marketplace Launch)

### BigCommerce App Registration
The `devtools.bigcommerce.com` portal has redirect issues. When ready:
1. Go to https://devtools.bigcommerce.com/my/apps (try in fresh incognito window)
2. Create app "BoostCart" with callback URLs:
   - Auth: `https://boostcart.vercel.app/api/auth/install`
   - Load: `https://boostcart.vercel.app/api/auth/load`
   - Uninstall: `https://boostcart.vercel.app/api/auth/uninstall`
3. Get marketplace Client ID/Secret (different from store-level API)
4. Update Vercel env vars with marketplace credentials

### Current Approach
For the demo, we used **Store-level API credentials** (created from the store admin panel) and manually inserted the store record into the database. This proves the full stack works. The OAuth marketplace flow is an additional step for when the app goes live on the BC App Marketplace.

---

## Proof of Concept
- Live demo page: https://boostcart.vercel.app/demo.html
- Shows: Order confirmation → BoostCart widget appears → Real product data from BC → Discount applied → CTA + timer
