# BLX Prompt #4 — Company Accounts: Claim Flow, Stripe, Profile, Communities

This is a follow-up to Prompts 1-3. Do NOT modify auth logic, communities/county data, or dark mode. Only ADD what's specified here. When finished, stop and ask me for next steps.

---

## Overview

Build the complete Company account experience:
1. **Company Card** (public page any visitor can see)
2. **Claim flow** (visitor claims an unclaimed business, pays $5 via Stripe)
3. **Company profile editor** (claimed business owner edits their info)
4. **Community selection** (pick counties to serve, first free, $2 each additional via Stripe)
5. **Company Dashboard** (replace the "Coming Soon" placeholder)
6. **Stripe integration** (Checkout for payments, webhooks for confirmation)

---

## Part A: Stripe Setup

### Install
```bash
npm install stripe
```

### Environment Variables (read from Replit Secrets)
- `STRIPE_SECRET_KEY` — Stripe secret key (starts with sk_test_ or sk_live_)
- `STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (starts with pk_test_ or pk_live_)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (starts with whsec_)
- `VITE_STRIPE_PUBLISHABLE_KEY` — same publishable key, exposed to frontend

### Create a Stripe utility file
Create `artifacts/api-server/src/lib/stripe.ts`:
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});
```

### Webhook Endpoint
Create `POST /api/webhooks/stripe` — this must:
1. Use `express.raw({ type: 'application/json' })` middleware (NOT the default JSON parser) for this route only
2. Verify the webhook signature using `stripe.webhooks.constructEvent()`
3. Handle these event types:
   - `checkout.session.completed` — process successful payments
4. Return 200 immediately after processing

**Important:** The webhook route must be registered BEFORE the global `express.json()` middleware, or use a separate router with raw body parsing. The raw body is required for signature verification.

---

## Part B: Company Card (Public Page)

### Route: `/company/:slug` or `/company/:id`

This is the public-facing company page that anyone (visitor, consumer, other business) can see.

### What it shows:
- Company name (large heading)
- Company logo (placeholder circle with first letter of company name for now — image upload comes later)
- Description/about text
- Categories (badges/pills)
- Communities served (list of county names)
- Website link (if set)
- Phone number (if set and company has opted to show it)
- Address (city, state — not full address)
- "Claim this business" button (only shown if company is unclaimed, i.e., `claimed_by_user_id` is null)
- "Contact" button (only shown if company is claimed — placeholder for now, will link to in-app messaging later)

### Backend endpoint:
`GET /api/companies/:id` — public, no auth required. Returns company data + categories + communities. Filters out soft-deleted records. Does NOT return sensitive data (email, full address, etc.).

---

## Part C: Claim Flow

### How it works:
1. Visitor is on a Company Card page for an unclaimed business
2. They click "Claim this business"
3. If not logged in → redirect to sign-up page with role pre-set to "company" and a `returnUrl` query param
4. If logged in but not a company role → show error: "Only company accounts can claim businesses"
5. If logged in as company role:
   a. Check system_settings for `company.claim_fee_cents` (default 500 = $5.00)
   b. Check system_settings for `company.first_claim_free` — if true AND this user has never claimed a business, skip payment
   c. If payment required → create a Stripe Checkout session and redirect to Stripe
   d. If free (first-time waiver) → claim immediately without payment

### Stripe Checkout for claim:
- Create a Checkout session with:
  - `mode: 'payment'` (one-time)
  - `line_items`: one item with the claim fee amount and description "Business Claim Fee"
  - `metadata`: `{ type: 'company_claim', company_id: '...', user_id: '...' }`
  - `success_url`: `/company/${companyId}?claimed=true`
  - `cancel_url`: `/company/${companyId}?claimed=cancelled`
- On webhook `checkout.session.completed` where metadata.type === 'company_claim':
  - Update the company record: set `claimed_by_user_id` to the user, set `claimed_at` to now, set `status` to 'active'
  - Create an audit_log entry

### Backend endpoints:
- `POST /api/companies/:id/claim` — requires auth (company role). Checks eligibility, creates Stripe Checkout session or claims directly if free. Returns `{ checkoutUrl }` or `{ claimed: true }`.
- The webhook handler (Part A) processes the actual claim on payment completion.

### What happens after claiming:
- The user is now the owner of that company
- They see the Company Dashboard instead of the visitor Company Card
- They can edit the company profile
- The "Claim this business" button disappears from the public card
- A "Manage" or "Edit Profile" button appears instead (for the owner only)

---

## Part D: Company Profile Editor

### Route: `/company/edit` (or `/company/profile`)

Only accessible to logged-in company users who have claimed a business.

### Fields:
- **Business name** (text input, required)
- **Description** (textarea, optional, max 500 chars)
- **Website** (URL input, optional)
- **Phone** (text input, optional) — this is the BUSINESS phone, not the user's personal phone
- **Address fields**: Street, City, State (dropdown of US states), ZIP code
- **Categories**: Multi-select from existing categories table. Show categories as a searchable list or a set of checkboxes. Allow selecting up to 5 categories.
- **Logo**: For now, show a placeholder circle with the first letter of the company name and text saying "Image upload coming soon". Do NOT build upload functionality.

### Backend endpoints:
- `GET /api/company/profile` — requires auth (company role). Returns the user's claimed company data + categories + communities.
- `PUT /api/company/profile` — requires auth (company role). Updates company fields. Validates required fields. Returns updated company.
- `PUT /api/company/profile/categories` — requires auth. Accepts an array of category IDs. Replaces all existing company-category associations. Max 5 categories.

### Where categories come from:
The categories table should have some seed data. Add a seed script (or add to the existing seed script) that inserts ~20 common business categories. Examples:
- Restaurant / Food Service
- Home Services / Repair
- HVAC / Plumbing / Electrical
- Landscaping / Lawn Care
- Auto Repair / Detailing
- Cleaning Services
- Real Estate
- Legal Services
- Accounting / Tax
- Marketing / Advertising
- IT / Technology
- Health / Wellness
- Fitness / Personal Training
- Pet Services
- Beauty / Salon
- Construction / Remodeling
- Roofing
- Photography / Videography
- Event Planning
- Education / Tutoring

These should have `taxonomy = 'company'` to distinguish them from post categories.

---

## Part E: Community Selection

### How it works:
- On the Company Profile page, there's a "Communities" section
- Shows currently selected communities (counties)
- "Add Community" button opens a searchable dropdown/modal of counties
- User can search by county name or state
- First community is free (required — every company must have at least one)
- Each additional community costs $2 (from system_settings `company.community_add_fee_cents`, default 200)
- Payment is via Stripe Checkout (same pattern as claim flow)
- Once paid, the community is permanently added (no subscription, one-time fee)
- Community can be removed but the fee is NOT refunded

### Backend endpoints:
- `GET /api/company/communities` — requires auth. Returns the user's company communities.
- `POST /api/company/communities/add` — requires auth. Accepts a community_id.
  - If this is the company's first community → add for free
  - If not first → check `company.community_add_fee_cents` setting → create Stripe Checkout session
  - metadata: `{ type: 'community_add', company_id: '...', community_id: '...', user_id: '...' }`
  - success_url: `/company/edit?community_added=true`
  - cancel_url: `/company/edit?community_added=cancelled`
- `DELETE /api/company/communities/:communityId` — requires auth. Removes a community. Cannot remove the last community (minimum 1 required). No refund.
- The webhook handler processes community additions on payment completion.

### Community search endpoint:
- `GET /api/communities/search?q=montgomery&state=TX&limit=20` — public, no auth required. Searches communities by name, optionally filtered by state. Returns id, name, display_name, state, fips_code. Only returns `is_county = true` communities for now (custom communities come later).

---

## Part F: Company Dashboard

### Route: `/dashboard` (for company role users)

Replace the "Coming Soon" placeholder with a real dashboard.

### What it shows:
- **Welcome header**: "Welcome back, [company name]" with the company logo placeholder
- **Quick stats row** (all placeholder/zero values for now, we'll connect real data later):
  - Echo Pricing bids received: 0
  - Profile views: 0
  - Credits earned: 0
- **Quick actions**:
  - "Edit Profile" → links to /company/edit
  - "View Company Card" → links to /company/[id]
  - "Browse Echo Pricing" → links to /echo-pricing (placeholder page)
- **Communities section**: Shows the communities the company belongs to with an "Add Community" link
- **Recent activity**: Empty state with text "No recent activity yet"

### Backend endpoint:
- `GET /api/company/dashboard` — requires auth (company role). Returns company data + communities + placeholder stats.

---

## Part G: Seed Some Unclaimed Companies

Add a seed script that creates ~10 sample unclaimed companies in the database so the claim flow can be tested. These represent businesses that were "imported" before any user claimed them.

Example seed companies (all in Montgomery County, TX and Harris County, TX):
1. Joe's BBQ & Grill — Restaurant / Food Service
2. Lone Star Plumbing — HVAC / Plumbing / Electrical  
3. Texas Green Lawns — Landscaping / Lawn Care
4. Bayou City Auto — Auto Repair / Detailing
5. Sparkle Clean Houston — Cleaning Services
6. Woodlands Realty Group — Real Estate
7. Magnolia Tax & Accounting — Accounting / Tax
8. Gulf Coast Marketing — Marketing / Advertising
9. Piney Woods IT Solutions — IT / Technology
10. Conroe Fitness Club — Fitness / Personal Training

Each should have:
- `claimed_by_user_id: null` (unclaimed)
- `status: 'unclaimed'`
- A name, description, city, state
- Linked to one community (Montgomery County, TX or Harris County, TX)
- Linked to one category

### Also seed: A browseable company listing page
Create `GET /api/companies?community_id=xxx&category_id=xxx&page=1&limit=20` — public endpoint that returns a paginated list of companies. Supports filtering by community and category. Returns both claimed and unclaimed companies (but unclaimed ones show less info).

Create a simple `/companies` page in the frontend that shows a grid/list of company cards with search and filter options (community dropdown, category dropdown). Each card links to the company's public page.

---

## Updated Navigation

After this prompt, the Company role navigation should have working pages:
- **Dashboard** → real dashboard (not "Coming Soon")
- **Company Card** → public view of their business
- **Edit Profile** → company profile editor (reachable from dashboard)

The visitor navigation should now have:
- A way to browse companies (the `/companies` page)
- Individual company cards at `/company/:id`

---

## What NOT To Do

- Do NOT modify auth logic (Prompts 1-3)
- Do NOT modify dark mode or county data
- Do NOT build image upload (logo is a placeholder for now)
- Do NOT build in-app messaging
- Do NOT build Echo Pricing beyond placeholder links
- Do NOT build Owner Exchange
- Do NOT create Stripe products/prices in the dashboard — use inline price_data in Checkout sessions
- Do NOT add Stripe Connect (that's for consultant payouts, comes later)
- Do NOT hardcode fee amounts — always read from system_settings table
