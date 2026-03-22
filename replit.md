# Workspace

## Overview

BLX (Blue Label Exchange) — a mobile-first B2B marketplace and consulting platform. pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Frontend**: React + Vite + Wouter + TanStack React Query + shadcn/ui + Tailwind CSS
- **Auth**: Custom session-based (bcrypt + HTTP-only cookies)
- **Build**: esbuild (API server), Vite (frontend)

## Brand Colors

- Navy: #244574
- Gold: #EBCB68
- Fox Orange: #C87540
- Coffee Brown: #7A5C44
- Charcoal: #3C3C3C
- Dusty Sage: #9CAF88

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port via PORT env)
│   ├── blx-web/            # React + Vite frontend (preview at /)
│   └── mockup-sandbox/     # Component preview server
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (seed, etc.)
├── ARCHITECTURE.md         # Full architecture documentation
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

~35 tables across 14 schema files in `lib/db/src/schema/`. Key tables: users, sessions, companies, consumers, consultants, communities, categories, tags, bookings, posts, credit_transactions, echo_requests, echo_bids, kitchen_items, saved_items, notifications, audit_logs, system_settings, joe_modules.

All monetary amounts stored in cents (integer). Soft deletes via `deleted_at` column. See `ARCHITECTURE.md` for full table documentation.

## Auth System

- Custom session-based auth with multiple auth methods
- bcrypt password hashing (12 rounds)
- HTTP-only cookie (`blx_session`) with 7-day expiry
- Server-side session storage in `sessions` table
- Middleware: `withAuth()` and `withRole()` in `artifacts/api-server/src/lib/auth.ts`
- Frontend: `useAuth()` hook from `artifacts/blx-web/src/lib/auth.tsx`
- IP rate limiting: 5 attempts per minute on login/register
- Roles: company, consumer, consultant, content_admin, support_admin, finance_admin, admin, super_admin

### Auth Methods
- **Email/password**: Traditional login/register with bcrypt
- **Google OAuth**: Via `google-auth-library` token verification (requires `GOOGLE_CLIENT_ID` env var)
- **Magic links**: Token-based email login/verification/password-reset (15-min expiry, logged to console in dev)
- **SMS verification**: 6-digit code phone verification for authenticated users (10-min expiry, 5 attempts max)
- **Password reset**: Via magic link with purpose=password_reset, invalidates all sessions on reset

### Auth Tables
- `users` — email, passwordHash (nullable for Google-only), phone, phoneVerified, emailVerified
- `sessions` — token-based with 7-day expiry
- `accounts` — OAuth provider links (provider + providerAccountId, unique constraint)
- `magic_link_tokens` — email, token, purpose (login/verify_email/password_reset), expiresAt, used
- `sms_verification_codes` — userId, phone, code, purpose, expiresAt, used, attempts

### Auth API Routes
- `POST /api/auth/google` — Google sign-in (returns user or `needsRole: true` for new users)
- `POST /api/auth/google/complete` — Complete Google registration with role selection
- `POST /api/auth/magic-link/request` — Request magic link (email + purpose)
- `POST /api/auth/magic-link/verify` — Verify magic link token
- `POST /api/auth/password-reset` — Reset password using magic link token
- `POST /api/auth/sms/send` — Send SMS verification code (requires auth)
- `POST /api/auth/sms/verify` — Verify SMS code (requires auth)

## API Routes

| Prefix | Purpose | Auth |
|--------|---------|------|
| /api/auth/* | Authentication | Public |
| /api/admin/* | Admin panel | Admin roles |

## Frontend Pages

- Home, Sign In, Sign Up — fully implemented
- All role-specific pages — placeholder "Coming Soon" stubs
- Navigation changes based on user role (visitor, company, consumer, consultant, admin)
- Mobile hamburger menu via shadcn Sheet component

## Design System

Neumorphic / textured / depth design with glassmorphism header. Custom CSS classes in `index.css`:
- `.neu-card`, `.neu-raised`, `.neu-pressed`, `.neu-surface`, `.neu-icon`, `.neu-btn` — neumorphic shadow/background utilities
- `.neu-page-bg` — soft page background with radial color washes
- `.glass-header` — glassmorphic header with backdrop-blur
- `.depth-gradient` — multi-stop navy gradient for hero sections
- `.texture-grain` — SVG noise overlay
- `.shimmer`, `.float-slow`, `.float-medium` — animations
- All neumorphic classes have `.dark` variants for dark mode

## Dark Mode

- Toggle button (sun/moon icon) in header
- Persisted in `localStorage` as `blx-theme`
- Defaults to system preference (`prefers-color-scheme`)
- Tailwind 4 class strategy via `@custom-variant dark (&:is(.dark *))`
- ThemeProvider context in `artifacts/blx-web/src/lib/theme.tsx`
- Dark colors: bg #1a1a1a, cards #2a2a2a, text white/off-white, accents same gold/fox-orange

## Seed Data

Run: `pnpm --filter @workspace/scripts run seed`
- Super admin: admin@bluelabelexchange.com / ChangeMeNow123!
- 22 system settings (fees, limits, percentages)
- 3 booking types (Discovery $0, Standard $35, Deep Dive $60)

Run: `pnpm --filter @workspace/scripts run seed-counties`
- Seeds ~3,235 US counties into `communities` table from Census Bureau FIPS data
- Includes all 50 states + DC + territories (PR, GU, VI, AS, MP)
- Data file: `scripts/data/national_county2020.txt`
- Each row: name, state, display_name, fips_code, is_county=true, is_custom=false, approximate lat/lon

## Placeholder Services

Stub files exist for future integrations:
- `artifacts/api-server/src/lib/stripe/index.ts`
- `artifacts/api-server/src/lib/email/index.ts`
- `artifacts/api-server/src/lib/sms/index.ts`

## Important Notes

- bcrypt is externalized in esbuild build.mjs and added to `onlyBuiltDependencies` in pnpm-workspace.yaml
- All API fetches from frontend use `credentials: "include"` for cookie auth
- System settings table is the single source of truth for all configurable values — never hardcode fees/rates/limits
- Frontend uses Wouter for routing with `import.meta.env.BASE_URL` as base

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files emitted during typecheck; JS bundling handled by esbuild/vite

## Root Scripts

- `pnpm run build` — typecheck then build all packages
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server with auth routes, admin routes, and auth middleware.

### `artifacts/blx-web` (`@workspace/blx-web`)
React + Vite frontend with shadcn/ui components, role-aware navigation, auth pages.

### `lib/db` (`@workspace/db`)
Drizzle ORM schema (~35 tables) + PostgreSQL connection.

### `scripts` (`@workspace/scripts`)
Seed script and utilities. Run via `pnpm --filter @workspace/scripts run <script>`.
