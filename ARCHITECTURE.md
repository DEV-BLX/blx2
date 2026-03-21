# BLX Architecture

## Overview

BLX (Blue Label Exchange) is a mobile-first web application for business consulting, a B2B marketplace, and a consumer-to-business bidding system (Echo Pricing). It uses a pnpm monorepo with a React + Vite frontend and an Express API backend, backed by PostgreSQL via Drizzle ORM.

## User Roles

One account = one role. No dual roles.

| Role | Description |
|------|-------------|
| company | Business accounts that can claim profiles, receive bids, post to Owner Exchange |
| consumer | Consumer accounts that use Echo Pricing to request bids |
| consultant | Consultants who offer paid bookings and can post to Owner Exchange |
| content_admin | Admin with content management permissions |
| support_admin | Admin with support/customer service permissions |
| finance_admin | Admin with finance/billing permissions |
| admin | Full admin access |
| super_admin | Highest privilege, can modify system settings |

### Permission Hierarchy

- All admin roles (content_admin, support_admin, finance_admin, admin, super_admin) can access /api/admin/* endpoints
- Only super_admin can modify system settings
- Public routes (visitor) require no authentication
- Role-specific routes require withAuth() + withRole() middleware

## Database Tables

### Core Tables
- **users** — All user accounts with email, password hash, role, status, referral code
- **sessions** — Server-side session storage for authentication (token + expiry)
- **companies** — Business profiles (can be unclaimed/imported or claimed by a user)
- **consumers** — Consumer profiles linked to user accounts
- **consultants** — Consultant profiles with booking settings and Stripe Connect info

### Taxonomy & Geography
- **communities** — Geographic communities (counties, cities, custom areas)
- **company_communities** — Many-to-many: which communities a company serves
- **consultant_communities** — Many-to-many: which communities a consultant covers
- **categories** — Hierarchical categories with parent/child and separate taxonomies for companies vs posts
- **tags** — User-created tags for companies and posts
- **company_tags** — Many-to-many: tags on companies
- **tag_category_associations** — Loose associations between tags and categories for smart suggestions
- **consultant_categories** — Many-to-many: categories a consultant covers

### Booking System
- **booking_types** — Types of sessions (Discovery, Standard, Deep Dive) with pricing
- **bookings** — Individual booking records between companies/consumers and consultants
- **consultant_payouts** — Payout tracking for consultant earnings from bookings

### Owner Exchange (Content Marketplace)
- **posts** — Content items (deals, guides, digital products, tools, templates, resources)
- **post_tags** — Many-to-many: tags on posts

### Credits System
- **credit_transactions** — Ledger of all credit movements (earn, spend, refund, etc.)
- **credit_offers** — Offers attached to posts that reward credits for completion
- **credit_offer_completions** — Records of users completing credit offers

### Echo Pricing (Consumer Bidding)
- **echo_requests** — Consumer requests for bids from local businesses
- **echo_request_communities** — Many-to-many: which communities a request targets
- **echo_bids** — Company bids on echo requests
- **echo_messages** — Messages between consumer and company within a bid

### Kitchen Access (SaaS Marketplace)
- **kitchen_items** — SaaS tools/products available for purchase or subscription
- **kitchen_purchases** — Purchase/subscription records

### Saved Workspace
- **saved_items** — Items saved by users (posts, companies, external links)
- **saved_folders** — Folders for organizing saved items

### Notifications & Audit
- **notifications** — In-app, email, SMS, Slack notifications
- **audit_logs** — Audit trail for all significant actions

### System Configuration
- **system_settings** — Key-value store for all configurable values (fees, limits, percentages)

### Referrals
- **referral_rewards** — Tracks referral rewards between users

### AI / Joe
- **joe_modules** — AI module configurations (prompts, models, allowed actions)
- **joe_logs** — Logs of AI module executions

## API Route Conventions

| Prefix | Purpose | Auth Required |
|--------|---------|---------------|
| /api/auth/* | Authentication (login, register, logout, me) | No (public) |
| /api/admin/* | Admin panel endpoints | Yes (admin roles) |
| /api/company/* | Company-specific endpoints (future) | Yes (company) |
| /api/consumer/* | Consumer-specific endpoints (future) | Yes (consumer) |
| /api/consultant/* | Consultant-specific endpoints (future) | Yes (consultant) |

## Naming Conventions

- **JavaScript/TypeScript**: camelCase for variables, functions, and properties
- **Database columns**: snake_case
- **Database tables**: snake_case (plural)
- **API routes**: kebab-case paths
- **Enums**: snake_case values

## System Settings Pattern

All configurable values (fees, rates, limits, percentages) are stored in the `system_settings` table. **Never hardcode** fee amounts, rates, or limits. Always read from system_settings at runtime.

Settings use a key-value pattern with typed values:
- key: dotted namespace (e.g., "echo_pricing.bid_fee_cents")
- value: stored as text, parsed according to the type column
- type: integer, decimal, boolean, string, json
- category: groups settings for admin UI display

## Monetary Values

All monetary amounts are stored as integers in cents (e.g., $5.00 = 500 cents). This avoids floating-point precision issues.

## Soft Deletes

All major tables use soft deletes via a `deleted_at` timestamp column. Records are never physically deleted; they are marked with a timestamp. Queries should filter out soft-deleted records (WHERE deleted_at IS NULL).

## Important Notes

- Future features should reference existing tables, not create new ones without checking this document first
- The database schema is designed to support all planned features; tables exist even if their associated features aren't built yet
- US county seed data is handled separately and is not part of the initial schema setup
