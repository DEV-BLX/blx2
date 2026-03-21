# BLX (Blue Label Exchange) — Project Foundation Setup

## What This App Is

BLX is a mobile-first web application for business consulting, a B2B marketplace, and a consumer-to-business bidding system called Echo Pricing. It serves 5 user types: Visitor (public), Company (business), Consumer, Consultant, and Admin (multiple tiers). One account = one role, no dual roles.

The app's brand language uses light diner/restaurant theming (Appetizers, Meat & Potatoes, Kitchen Access, etc.) but the product is 75% serious business tool, 25% personality.

## Tech Stack — Use Exactly This

- **Framework:** Next.js with React (App Router)
- **Database:** Replit's native PostgreSQL (use the built-in DATABASE_URL)
- **ORM:** Drizzle ORM (with drizzle-kit for migrations)
- **Auth:** Custom session-based authentication (NO Supabase, NO Clerk, NO NextAuth — build it from scratch with bcrypt + server-side sessions stored in PostgreSQL)
- **Styling:** Tailwind CSS with shadcn/ui components
- **Server:** Listen on 0.0.0.0

## What To Build In This First Step

### 1. Project Structure

Create a clean, modular project structure:

```
/src
  /app                  (Next.js App Router pages)
    /api                (API routes)
      /auth             (login, register, logout, password-reset)
      /admin            (admin API endpoints — will grow later)
    /(public)           (public pages — home, services, etc.)
    /(dashboard)        (authenticated pages per role)
    /admin              (admin panel pages)
  /components           (shared React components)
    /ui                 (shadcn/ui components)
    /layout             (navigation, headers, footers)
  /lib                  (shared utilities)
    /db                 (database connection, schema, migrations)
    /auth               (session management, middleware, password hashing)
    /stripe             (Stripe service layer — placeholder for now)
    /email              (Resend service layer — placeholder for now)
    /sms                (Twilio service layer — placeholder for now)
  /types                (TypeScript type definitions)
```

### 2. Database Schema

Create the COMPLETE database schema below using Drizzle ORM. Create ALL tables now even though we won't use them all immediately. This is critical — later features must build on existing tables, not create new ones.

**IMPORTANT: Store all monetary amounts as integers (cents). Use soft deletes (deleted_at column) everywhere. Add created_at, updated_at, created_by, updated_by on every table.**

#### Core Tables:

**users**
- id (uuid, primary key)
- email (text, unique, not null)
- password_hash (text, not null)
- role (enum: 'company', 'consumer', 'consultant', 'content_admin', 'support_admin', 'finance_admin', 'admin', 'super_admin')
- status (enum: 'active', 'suspended', 'pending_verification', 'deactivated')
- referral_code (text, unique) — auto-generated like "BLX-J4K7M"
- referred_by_user_id (uuid, nullable, references users)
- email_verified (boolean, default false)
- last_login_at (timestamp)
- deleted_at, created_at, updated_at, created_by, updated_by

**sessions**
- id (uuid, primary key)
- user_id (uuid, references users)
- token (text, unique, not null)
- expires_at (timestamp, not null)
- created_at

**companies**
- id (uuid, primary key)
- user_id (uuid, references users, nullable) — null if unclaimed/imported
- name (text, not null)
- description (text)
- website (text)
- phone (text)
- email (text) — business contact email, NOT account email
- image_url (text)
- city (text)
- state (text)
- is_claimed (boolean, default false)
- claim_paid (boolean, default false)
- identity_verified (boolean, default false)
- is_locally_owned (boolean)
- ownership_type (text)
- num_locations (integer)
- category_id (uuid, references categories)
- echo_pricing_enabled (boolean, default false)
- echo_pricing_paused (boolean, default false)
- stripe_customer_id (text)
- stripe_connect_account_id (text)
- import_batch_tag (text) — for tracking bulk imports
- import_status (enum: 'active', 'inactive', 'pending_claim', 'invited', nullable)
- fit_score (integer, nullable) — admin-only
- intent_score (integer, nullable) — admin-only
- urgency_flag (text, nullable) — admin-only
- company_type_label (text, nullable) — admin-only classification
- verification_badge_visible (boolean, default false)
- status (enum: 'active', 'inactive', 'suspended', 'draft')
- deleted_at, created_at, updated_at, created_by, updated_by

**consumers**
- id (uuid, primary key)
- user_id (uuid, references users, not null)
- display_name (text)
- city (text)
- state (text)
- deleted_at, created_at, updated_at

**consultants**
- id (uuid, primary key)
- user_id (uuid, references users, not null)
- name (text, not null)
- bio (text)
- image_url (text)
- website (text)
- booking_url (text)
- accepting_bookings (boolean, default true)
- status (enum: 'active', 'inactive', 'suspended')
- stripe_connect_account_id (text)
- deleted_at, created_at, updated_at, created_by, updated_by

**communities**
- id (uuid, primary key)
- name (text, not null) — display name like "Harris County"
- state (text) — two-letter abbreviation
- display_name (text, not null) — "Harris County, TX"
- fips_code (text, nullable) — for county-based communities
- is_county (boolean, default false)
- latitude (decimal, nullable)
- longitude (decimal, nullable)
- is_custom (boolean, default false) — true for admin-created communities
- status (enum: 'active', 'inactive')
- deleted_at, created_at, updated_at

**company_communities** (many-to-many)
- id (uuid, primary key)
- company_id (uuid, references companies)
- community_id (uuid, references communities)
- is_primary (boolean, default false)
- paid (boolean, default false) — was this a paid community add?
- payment_id (text, nullable) — Stripe payment reference
- created_at

**categories**
- id (uuid, primary key)
- name (text, not null)
- parent_id (uuid, nullable, references categories) — null = top-level category, non-null = sub-category
- taxonomy_type (enum: 'company', 'post') — separate taxonomies
- sort_order (integer, default 0)
- status (enum: 'active', 'inactive')
- deleted_at, created_at, updated_at

**tags**
- id (uuid, primary key)
- name (text, not null)
- created_by_company_id (uuid, nullable, references companies)
- is_promoted (boolean, default false) — admin-promoted for wider use
- status (enum: 'active', 'inactive')
- created_at, updated_at

**company_tags** (many-to-many)
- company_id (uuid, references companies)
- tag_id (uuid, references tags)

**tag_category_associations** (loose associations for smart suggestion)
- tag_id (uuid, references tags)
- category_id (uuid, references categories)
- strength (integer, default 1) — how strong the association is

**consultant_communities** (many-to-many)
- consultant_id (uuid, references consultants)
- community_id (uuid, references communities)

**consultant_categories** (many-to-many)
- consultant_id (uuid, references consultants)
- category_id (uuid, references categories)

#### Booking Tables:

**booking_types**
- id (uuid, primary key)
- name (text, not null) — "Discovery Session", "Standard Session", etc.
- duration_minutes (integer, not null)
- price_cents (integer, not null) — price in cents
- consultant_payout_percentage (decimal, not null) — default 92.5
- is_free (boolean, default false)
- status (enum: 'active', 'inactive')
- sort_order (integer, default 0)
- created_at, updated_at

**bookings**
- id (uuid, primary key)
- company_id (uuid, nullable, references companies)
- consumer_id (uuid, nullable)
- consultant_id (uuid, references consultants)
- booking_type_id (uuid, references booking_types)
- stripe_payment_intent_id (text)
- amount_cents (integer, not null)
- consultant_payout_cents (integer, not null)
- blx_revenue_cents (integer, not null)
- status (enum: 'pending_payment', 'paid', 'scheduled', 'completed', 'cancelled', 'no_show', 'disputed', 'comped')
- handoff_status (enum: 'pending', 'complete', 'incomplete', nullable)
- scheduled_at (timestamp, nullable)
- completed_at (timestamp, nullable)
- notes (text)
- deleted_at, created_at, updated_at

**consultant_payouts**
- id (uuid, primary key)
- consultant_id (uuid, references consultants)
- booking_id (uuid, references bookings)
- amount_cents (integer, not null)
- status (enum: 'unpaid', 'pending', 'paid', 'disputed', 'adjusted')
- stripe_transfer_id (text, nullable)
- paid_at (timestamp, nullable)
- created_at, updated_at

#### Owner Exchange Tables:

**posts**
- id (uuid, primary key)
- author_type (enum: 'company', 'consultant', 'admin')
- author_company_id (uuid, nullable, references companies)
- author_consultant_id (uuid, nullable, references consultants)
- author_admin_id (uuid, nullable, references users)
- display_author_name (text) — what shows publicly
- post_type (enum: 'deal', 'guide', 'digital_product', 'tool', 'template', 'resource', 'blx_content')
- title (text, not null)
- description (text)
- content (text) — full content/body
- category_id (uuid, references categories)
- subcategory_id (uuid, references categories)
- audience (enum: 'company', 'consumer', 'both', default 'company') — V1 is company only
- payment_model (enum: 'stripe', 'credits', 'either', 'free')
- price_cents (integer, nullable)
- credit_price (integer, nullable)
- platform_fee_percentage (decimal, nullable)
- platform_fee_flat_cents (integer, nullable)
- media_urls (jsonb, default '[]')
- external_link (text, nullable)
- download_url (text, nullable)
- download_limit (integer, nullable)
- download_expiry_hours (integer, nullable)
- status (enum: 'draft', 'pending_review', 'active', 'paused', 'expired', 'archived', 'rejected')
- scheduled_publish_at (timestamp, nullable)
- scheduled_expire_at (timestamp, nullable)
- published_at (timestamp, nullable)
- community_scope (jsonb) — snapshot of communities at publish time
- vote_count (integer, default 0)
- view_count (integer, default 0)
- deleted_at, created_at, updated_at, created_by, updated_by

**post_tags** (many-to-many)
- post_id (uuid, references posts)
- tag_id (uuid, references tags)

#### Credits Tables:

**credit_transactions**
- id (uuid, primary key)
- user_id (uuid, references users)
- amount (integer, not null) — positive = earn, negative = spend
- balance_after (integer, not null)
- type (enum: 'purchase', 'reward', 'spend', 'vote', 'redemption', 'refund', 'expired', 'admin_adjustment', 'referral', 'credit_offer_reward')
- reference_type (text, nullable) — 'echo_request', 'credit_offer', 'post_unlock', 'credit_pack', etc.
- reference_id (uuid, nullable) — ID of the related entity
- description (text)
- status (enum: 'completed', 'pending', 'held', 'reversed')
- expires_at (timestamp, nullable)
- created_at

**credit_offers**
- id (uuid, primary key)
- post_id (uuid, references posts)
- reward_amount (integer, not null) — credits per completion
- max_completions (integer, nullable)
- current_completions (integer, default 0)
- completion_rule (enum: 'one_time', 'repeat_with_cap', 'repeat_with_cooldown', 'max_completions')
- cooldown_hours (integer, nullable)
- approval_mode (enum: 'manual', 'delayed_auto', 'rule_based')
- auto_approval_delay_hours (integer, nullable)
- funded_amount (integer, not null) — total credits reserved
- remaining_funded (integer, not null)
- status (enum: 'active', 'paused', 'exhausted', 'expired', 'archived')
- admin_approved (boolean, default false) — required if reward > 100
- created_at, updated_at

**credit_offer_completions**
- id (uuid, primary key)
- credit_offer_id (uuid, references credit_offers)
- user_id (uuid, references users)
- proof_type (enum: 'text', 'url', 'file', 'image', 'video', 'receipt', 'code', 'manual_business', 'admin')
- proof_content (text)
- proof_file_url (text, nullable)
- status (enum: 'accepted', 'in_progress', 'submitted', 'pending_business_review', 'pending_admin_review', 'approved', 'rejected', 'expired', 'disputed')
- dispute_reason (text, nullable)
- dispute_evidence_url (text, nullable)
- reviewed_by (uuid, nullable, references users)
- reviewed_at (timestamp, nullable)
- credits_awarded (integer, nullable)
- created_at, updated_at

#### Echo Pricing Tables:

**echo_requests**
- id (uuid, primary key)
- consumer_id (uuid, references consumers)
- title (text, not null)
- description (text, not null)
- category_id (uuid, references categories)
- budget_min_cents (integer, nullable)
- budget_max_cents (integer, nullable)
- preferred_timeline (text)
- service_date (timestamp, nullable)
- special_notes (text)
- images (jsonb, default '[]') — up to 4 image URLs
- video_url (text, nullable)
- posting_fee_cents (integer, not null)
- posting_fee_paid (boolean, default false)
- stripe_payment_intent_id (text, nullable)
- status (enum: 'draft', 'submitted', 'open', 'partially_responded', 'quoted', 'closed', 'expired', 'cancelled')
- bid_count (integer, default 0)
- max_bids (integer) — from system_settings
- expires_at (timestamp, nullable)
- no_bid_refund_eligible (boolean, default true)
- refunded (boolean, default false)
- closed_at (timestamp, nullable)
- deleted_at, created_at, updated_at

**echo_request_communities** (many-to-many — which communities this request targets)
- echo_request_id (uuid, references echo_requests)
- community_id (uuid, references communities)

**echo_bids**
- id (uuid, primary key)
- echo_request_id (uuid, references echo_requests)
- company_id (uuid, references companies)
- bid_amount_cents (integer, nullable)
- bid_range_min_cents (integer, nullable)
- bid_range_max_cents (integer, nullable)
- estimated_timeline (text)
- message (text, not null)
- media_urls (jsonb, default '[]')
- bid_fee_cents (integer, not null)
- bid_fee_paid (boolean, default false)
- bid_fee_waived (boolean, default false) — first-time waiver
- stripe_payment_intent_id (text, nullable)
- is_awarded (boolean, default false)
- awarded_at (timestamp, nullable)
- completion_fee_cents (integer, nullable) — charged at award
- completion_fee_mode (enum: 'flat', 'percentage')
- completion_fee_paid (boolean, default false)
- completion_fee_stripe_id (text, nullable)
- receipt_url (text, nullable) — consumer uploads this
- receipt_uploaded_at (timestamp, nullable)
- receipt_approved (boolean, nullable)
- receipt_reviewed_by (uuid, nullable, references users)
- receipt_reviewed_at (timestamp, nullable)
- consumer_credits_awarded (integer, nullable)
- job_status (enum: 'pending', 'in_progress', 'completed', 'post_award_cancellation', nullable)
- company_status (enum: 'available', 'viewed', 'responded', 'passed', 'expired', 'withdrawn')
- bid_status (enum: 'draft', 'submitted', 'updated', 'accepted', 'not_selected', 'withdrawn', 'expired')
- deleted_at, created_at, updated_at

**echo_messages**
- id (uuid, primary key)
- echo_bid_id (uuid, references echo_bids)
- sender_type (enum: 'consumer', 'company')
- sender_user_id (uuid, references users)
- message (text, not null)
- created_at

#### Kitchen Access Tables:

**kitchen_items**
- id (uuid, primary key)
- name (text, not null)
- description (text)
- image_url (text)
- purchase_type (enum: 'subscription', 'one_time', 'trial')
- price_cents (integer)
- stripe_product_id (text, nullable)
- stripe_price_id (text, nullable)
- trial_days (integer, nullable)
- external_url (text, nullable) — link to the actual SaaS product
- status (enum: 'active', 'inactive', 'coming_soon')
- sort_order (integer, default 0)
- created_at, updated_at

**kitchen_purchases**
- id (uuid, primary key)
- user_id (uuid, references users)
- kitchen_item_id (uuid, references kitchen_items)
- stripe_subscription_id (text, nullable)
- stripe_payment_intent_id (text, nullable)
- status (enum: 'active', 'cancelled', 'expired', 'trial')
- purchased_at (timestamp)
- expires_at (timestamp, nullable)
- created_at, updated_at

#### Saved Workspace Tables:

**saved_items**
- id (uuid, primary key)
- user_id (uuid, references users)
- item_type (enum: 'post', 'company', 'external')
- post_id (uuid, nullable, references posts)
- company_id (uuid, nullable, references companies)
- external_url (text, nullable)
- external_label (text, nullable)
- notes (text, nullable)
- folder_id (uuid, nullable, references saved_folders)
- created_at, updated_at

**saved_folders**
- id (uuid, primary key)
- user_id (uuid, references users)
- name (text, not null)
- created_at, updated_at

#### Notification & Audit Tables:

**notifications**
- id (uuid, primary key)
- user_id (uuid, references users)
- type (text, not null) — 'booking_confirmed', 'bid_received', 'credits_earned', etc.
- title (text, not null)
- body (text)
- data (jsonb, nullable) — additional structured data
- read (boolean, default false)
- archived (boolean, default false)
- channel (enum: 'in_app', 'email', 'sms', 'slack')
- sent_at (timestamp, nullable)
- created_at

**audit_logs**
- id (uuid, primary key)
- user_id (uuid, nullable, references users)
- action (text, not null) — 'company.claimed', 'booking.created', 'credit.awarded', etc.
- entity_type (text, not null) — 'company', 'booking', 'credit', etc.
- entity_id (uuid)
- old_value (jsonb, nullable)
- new_value (jsonb, nullable)
- ip_address (text, nullable)
- metadata (jsonb, nullable)
- created_at

#### System Settings Table (THE KNOBS):

**system_settings**
- id (uuid, primary key)
- key (text, unique, not null) — 'echo_pricing.bid_fee_cents', 'booking.standard_price_cents', etc.
- value (text, not null) — stored as text, parsed by type
- type (enum: 'integer', 'decimal', 'boolean', 'string', 'json')
- category (text, not null) — 'echo_pricing', 'booking', 'credits', 'company', 'fees', etc.
- description (text) — human-readable explanation
- updated_by (uuid, nullable, references users)
- updated_at

#### Referral Tables:

**referral_rewards**
- id (uuid, primary key)
- referrer_user_id (uuid, references users)
- referred_user_id (uuid, references users)
- referral_code_used (text, not null)
- qualifying_action (text) — what the referred user did to trigger the reward
- referrer_credits_awarded (integer, nullable)
- referred_credits_awarded (integer, nullable)
- status (enum: 'pending', 'qualified', 'rewarded', 'voided')
- created_at, updated_at

#### Joe / AI Tables:

**joe_modules**
- id (uuid, primary key)
- name (text, unique, not null) — 'messaging', 'fraud', 'company_analysis', etc.
- system_prompt (text, not null)
- model (text, not null) — 'gpt-4o', 'gpt-4o-mini', etc.
- version (integer, default 1)
- is_active (boolean, default true)
- allowed_auto_actions (jsonb, default '[]')
- created_at, updated_at, updated_by (uuid, references users)

**joe_logs**
- id (uuid, primary key)
- module_id (uuid, references joe_modules)
- input (text)
- output (text)
- action_taken (text, nullable)
- was_auto_action (boolean, default false)
- tokens_used (integer, nullable)
- created_at

### 3. Seed Data

After creating the schema, seed the following:

**System Settings — insert these default values:**

| key | value | type | category | description |
|---|---|---|---|---|
| company.claim_fee_cents | 500 | integer | fees | One-time company claim fee |
| company.community_add_fee_cents | 200 | integer | fees | One-time fee to add extra community |
| echo_pricing.posting_fee_cents | 500 | integer | echo_pricing | Consumer request posting fee |
| echo_pricing.bid_fee_cents | 300 | integer | echo_pricing | Per-bid fee for companies |
| echo_pricing.completion_fee_cents | 4500 | integer | echo_pricing | Flat completion fee charged to company |
| echo_pricing.completion_fee_mode | flat | string | echo_pricing | flat or percentage |
| echo_pricing.completion_fee_percentage | 0 | decimal | echo_pricing | Percentage if mode is percentage |
| echo_pricing.max_bids_per_request | 25 | integer | echo_pricing | Max bids before request closes |
| echo_pricing.no_bid_refund_days | 3 | integer | echo_pricing | Days before no-bid refund |
| echo_pricing.receipt_upload_expiry_days | 60 | integer | echo_pricing | Days to upload receipt after award |
| echo_pricing.default_consumer_reward_credits | 50 | integer | echo_pricing | Default flat credit reward to consumer |
| echo_pricing.first_bid_waive_claim_fee | true | boolean | echo_pricing | Waive claim fee on first bid |
| echo_pricing.first_bid_waive_bid_fee | true | boolean | echo_pricing | Waive bid fee on first bid |
| booking.discovery_price_cents | 0 | integer | booking | Free discovery session |
| booking.standard_price_cents | 3500 | integer | booking | 30-min session price |
| booking.deep_dive_price_cents | 6000 | integer | booking | 60-min session price |
| booking.consultant_payout_percentage | 92.5 | decimal | booking | Default consultant payout split |
| credits.expiration_years | 5 | integer | credits | Years until credits expire |
| credits.min_redemption_credits | 20 | integer | credits | Minimum credits for Amazon redemption |
| credits.credit_offer_max_no_approval | 100 | integer | credits | Max reward without admin approval |
| credits.credit_offer_absolute_max | 250 | integer | credits | Absolute max reward per completion |
| referral.referrer_reward_credits | 5 | integer | referral | Credits earned by referrer |
| referral.referred_reward_credits | 5 | integer | referral | Welcome bonus for referred user |
| oe.min_platform_fee_percentage | 3.5 | decimal | owner_exchange | Minimum platform fee for OE sales |

**Super Admin Account:**
- Email: admin@bluelabelexchange.com
- Password: "ChangeMeNow123!" (hashed with bcrypt)
- Role: super_admin
- Status: active
- Auto-generate referral code

**Booking Types:**
- Discovery Session: 15 min, $0, free
- Standard Session: 30 min, $35, 92.5% consultant payout
- Deep Dive Session: 60 min, $60, 92.5% consultant payout

**DO NOT seed US counties yet — that will be a separate step.**

### 4. Authentication System

Build complete session-based auth:

- POST /api/auth/register — create account with email, password, role. Auto-generate referral code. Hash password with bcrypt (12 rounds). Create session. Set HTTP-only cookie.
- POST /api/auth/login — verify email + password, create session, set cookie.
- POST /api/auth/logout — delete session, clear cookie.
- GET /api/auth/me — return current user from session (or null).
- Middleware: withAuth() that checks session cookie, loads user, rejects if expired/missing.
- Middleware: withRole(roles[]) that checks if user has required role.
- Rate limiting on login/register (5 attempts per minute per IP).

### 5. Layout Shell with Role-Aware Navigation

Build a responsive mobile-first layout with:

- A top header with the BLX logo/name
- A navigation that changes based on user role:
  - **Visitor:** Home | Services | Tools | Assessment | Kitchen Access | Book | Consultants | Sign In / Sign Up
  - **Company:** Dashboard | Owner Exchange | Saved | Kitchen Access | Book | Company Card | Notifications | Account
  - **Consumer:** Dashboard | Echo Pricing | Saved | Credits | Challenges (Coming Soon) | Notifications | Account
  - **Consultant:** Dashboard | Bookings | Posts | Profile | Compensation | Notifications | Account
  - **Admin:** Dashboard | Companies | Consumers | Consultants | Bookings | Owner Exchange | Echo Pricing | Credits | Finance | Notifications | Joe's Playbook | Audit Logs | Settings
- Mobile: hamburger menu / bottom tab bar
- Each nav item should link to a placeholder page that says "[Page Name] — Coming Soon" with the correct layout
- Sign In and Sign Up pages should be fully functional (connected to the auth API)
- After login, redirect to the correct dashboard for that role

### 6. Brand Colors

Use these exact colors in the Tailwind config:

- Navy Blue: #244574 (primary — headers, buttons)
- Charcoal: #2D2926 (text)
- Gold: #EBCB68 (accents, highlights, dividers)
- Fox Orange: #C87540 (secondary CTAs, sub-headers)
- Dusty Sage: #7A8B6E (success, nature elements)
- Coffee Brown: #6B5B4F (subtle backgrounds, muted text)
- White: #FFFFFF (backgrounds)
- Terracotta Red: #B85C4D (alerts, errors, destructive actions)

### 7. Admin API Foundation

Create these placeholder API routes (they will be expanded later but need to exist now):

- GET /api/admin/stats — returns counts of users, companies, consumers, consultants, bookings (for admin dashboard)
- GET /api/admin/settings — returns all system_settings (protected: admin+ only)
- PUT /api/admin/settings/:key — update a single system setting (protected: super_admin only)

Protect all /api/admin/* routes with withAuth() + withRole(['admin', 'super_admin', 'content_admin', 'support_admin', 'finance_admin']).

### 8. ARCHITECTURE.md

Create a file at the project root called ARCHITECTURE.md that contains:
- A summary of all database tables and their purpose
- The role hierarchy and permission rules
- API route conventions (/api/auth/*, /api/admin/*, /api/company/*, /api/consumer/*, /api/consultant/*)
- Naming conventions (camelCase for JS, snake_case for DB)
- The system_settings pattern (all configurable values come from this table, never hardcoded)
- A note that future features should reference existing tables, not create new ones without checking here first

### What NOT To Do

- Do NOT use any external auth provider (no Supabase, Clerk, NextAuth, Auth0)
- Do NOT use any external database (use Replit's built-in PostgreSQL only)
- Do NOT hardcode any fee amounts, rates, or limits — always read from system_settings
- Do NOT seed US counties yet
- Do NOT build any feature pages yet — just placeholder pages with navigation
- Do NOT set up Stripe, Resend, Twilio, or any external service yet — just create placeholder service files
