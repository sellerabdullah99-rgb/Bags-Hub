# Bags Hub — C2C Bag Marketplace (Supabase-powered)

Bags Hub is now a multi-seller marketplace: anyone can register as a **seller**
and list their own bags, and anyone can register as a **buyer** and purchase
from any seller. All data — accounts, listings, orders — lives in Supabase.
There is no backend server to run; everything talks to Supabase directly
from the browser.

## Folder structure

```
porta-full/
├── index.html              Home page (live listings from all sellers)
├── shop.html                Shop All / category & collection filters
├── product.html              Product detail page (?id=<uuid>)
├── cart.html                 Cart + checkout (creates a real order in Supabase)
├── about.html                 Brand story page
├── contact.html                Contact form (saved to Supabase)
├── register.html               Create a buyer or seller account
├── login.html                   Log in
├── sell.html                     "Become a seller" landing page
├── seller-dashboard.html          Sellers: add/edit/delete listings, manage orders
├── my-orders.html                  Buyers: order history
├── css/style.css
├── js/
│   ├── config.js              ⚠️ put your Supabase URL + anon key here
│   ├── auth.js                 Sign up / log in / log out / session + nav
│   ├── products-data.js          Fetches the live catalog from Supabase
│   ├── cart.js                    Local cart (localStorage) until checkout
│   └── main.js                     Shared UI: nav, cart drawer, search, quiz
└── supabase/
    └── schema.sql               Run this once in the Supabase SQL Editor
```

## 1. Set up Supabase (one-time)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor**, paste the entire contents of `supabase/schema.sql`,
   and run it. This creates:
   - `profiles` (buyer/seller accounts, auto-created on signup)
   - `products` (each bag tied to a `seller_id`)
   - `orders` + `order_items` (orders split per seller)
   - `contact_messages`
   - Row Level Security policies so sellers can only edit their own bags,
     and buyers can only see their own orders.
3. Go to **Project Settings → API**, copy the **Project URL** and the
   **anon public** key.
4. Open `js/config.js` and paste them in:
   ```js
   const SUPABASE_URL = "https://your-project-ref.supabase.co";
   const SUPABASE_ANON_KEY = "your-anon-public-key";
   ```
5. In **Authentication → Providers**, make sure Email is enabled. For local
   testing you may want to turn **"Confirm email"** off (Authentication →
   Settings) so accounts work instantly without an email click.

## 2. Running the site

No build step, no server. Just open `index.html` in a browser, or drag the
whole `porta-full` folder into Netlify/Vercel as a static site.

## 3. How the marketplace works

- **Sellers**: register at `register.html` choosing "I want to Sell", then
  go to `seller-dashboard.html` to add bags (name, price, stock, colors,
  specs, description) and manage incoming orders for their own bags.
- **Buyers**: register choosing "I want to Buy", browse `shop.html`
  (bags from every seller, each card shows "Sold by ..."), add to cart,
  and check out on `cart.html`. Checkout requires login and creates a real
  order split per seller behind the scenes.
- Every seller's dashboard only ever shows **their own** listings and
  **their own** order line items — enforced by Supabase Row Level Security,
  not just hidden in the UI.

## 4. Before going live

- Replace the WhatsApp number (`923000000000`) in every page's floating
  button and the Contact page.
- Turn "Confirm email" back on in Supabase Auth settings for production.
- Rename "Bags Hub" to your final brand name (`.logo`, `.foot-logo`, `<title>`
  tags across the HTML files).
- Consider adding image upload via Supabase Storage — right now sellers
  pick an emoji as a placeholder icon instead of uploading a real photo.
