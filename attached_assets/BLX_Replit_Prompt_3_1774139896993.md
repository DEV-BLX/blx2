# BLX Prompt #3 — Auth Upgrades: Google OAuth, Magic Link, SMS Recovery

This is a follow-up to Prompts 1 and 2. Do NOT modify any existing functionality unless explicitly stated. Do NOT touch the communities/county data or dark mode. Only ADD what's specified here. When finished, stop and ask me for next steps.

---

## Overview

Add three new authentication methods alongside the existing email+password login:
1. **Google OAuth** ("Continue with Google")
2. **Magic Link** ("Sign in with email link")
3. **SMS Recovery** (for password reset / backup verification)

The existing email+password login stays as-is. All three new methods must create the same server-side session (stored in the sessions table) and use the same HTTP-only cookie (`blx_session`).

---

## Database Changes

Add a new table called `accounts` to support multiple auth methods per user:

```
accounts
- id (uuid, primary key)
- user_id (uuid, references users, not null)
- provider (text, not null) — 'credentials', 'google', 'magic_link'
- provider_account_id (text, nullable) — Google's sub claim, or null for credentials
- created_at (timestamp)
- UNIQUE constraint on (provider, provider_account_id)
```

Add these columns to the existing `users` table:
- `phone` (text, nullable) — for SMS recovery
- `phone_verified` (boolean, default false)

Make `password_hash` on the `users` table nullable (users who sign up via Google won't have a password).

Push the schema changes to the database.

---

## Part A: Google OAuth

### Frontend
- Install `@react-oauth/google`
- Wrap the app in `<GoogleOAuthProvider clientId={...}>` — read the client ID from an environment variable exposed to the frontend (e.g., `VITE_GOOGLE_CLIENT_ID`)
- On the Sign In page, add a "Continue with Google" button at the TOP of the form (above the email/password fields), styled as a prominent button with the Google "G" icon
- On the Sign Up page, add the same "Continue with Google" button at the top
- Use the popup flow (GoogleLogin component with `onSuccess` callback) — NOT redirect flow
- When Google returns the credential JWT, send it to `POST /api/auth/google`

### Backend
- Install `google-auth-library`
- Create `POST /api/auth/google` endpoint:
  1. Receive the Google credential JWT from the frontend
  2. Verify it using `OAuth2Client.verifyIdToken()` with the Google Client ID from environment variable `GOOGLE_CLIENT_ID`
  3. Extract email, name, and Google sub (unique ID) from the verified token
  4. Check if an account with provider='google' and provider_account_id=sub exists
     - If YES: find the linked user, create session, return user
     - If NO: check if a user with that email already exists
       - If email exists: auto-link the Google account to that user (create an accounts row), create session, return user
       - If email doesn't exist: this is a NEW user — but we need their role
  5. For new users via Google: return a response indicating role selection is needed. The frontend should show a role picker (Company, Consumer, Consultant) before completing registration. After role is selected, call `POST /api/auth/google/complete` with the Google credential + selected role to finish account creation.
- Create `POST /api/auth/google/complete` endpoint:
  1. Verify Google credential again
  2. Create the user with the selected role, email from Google, no password
  3. Create an accounts row with provider='google'
  4. Auto-generate referral code
  5. Handle referral code if provided
  6. Create session, return user

### Environment Variables
- `GOOGLE_CLIENT_ID` — server-side Google OAuth Client ID
- `VITE_GOOGLE_CLIENT_ID` — same value, exposed to frontend via Vite

**Note:** The actual Google Client ID will be added to Replit Secrets later. For now, make sure the code reads from these env vars and gracefully handles them being undefined (hide the Google button if no client ID is configured).

---

## Part B: Magic Link (Email Sign-In)

### How It Works
1. User enters their email on the sign-in page
2. Server generates a single-use, time-limited token and sends an email with a clickable link
3. User clicks the link → server verifies the token → creates a session → redirects to dashboard

### Database
Add a new table:
```
magic_link_tokens
- id (uuid, primary key)
- email (text, not null)
- token (text, unique, not null) — crypto.randomBytes(32).toString('hex')
- expires_at (timestamp, not null) — 15 minutes from creation
- used (boolean, default false)
- created_at (timestamp)
```

### Frontend
- On the Sign In page, add a "Sign in with email link" section BETWEEN the Google button and the email/password form
- UI: an email input field + "Send magic link" button
- After sending: show a confirmation message "Check your email! We sent you a sign-in link."
- Create a `/auth/magic-link/verify` page that handles the callback URL

### Backend
- Create `POST /api/auth/magic-link/send` endpoint:
  1. Receive email
  2. Check if a user with this email exists. If not, return an error: "No account found with this email. Please sign up first."
  3. Generate a secure random token
  4. Store in magic_link_tokens table with 15-minute expiry
  5. Send an email with a link: `{APP_URL}/auth/magic-link/verify?token={token}`
  6. For now, since Resend isn't set up yet: LOG the magic link URL to the server console so we can test it. Also return it in the API response (development only — remove before production).
  7. Return success message

- Create `GET /api/auth/magic-link/verify` endpoint:
  1. Receive token from query params
  2. Look up in magic_link_tokens table
  3. Check: exists? not used? not expired?
  4. If valid: mark as used, find the user by email, create session, redirect to appropriate dashboard
  5. If invalid/expired: redirect to sign-in page with error message

### Rate Limiting
- Max 3 magic link requests per email per 10 minutes
- Max 10 magic link requests per IP per 10 minutes

---

## Part C: SMS Recovery (Password Reset + Verification)

### How It Works
- User clicks "Forgot password?" on the sign-in page
- They can choose: "Reset via email" (magic link to reset page) OR "Reset via SMS" (if they have a phone number on file)
- SMS sends a 6-digit OTP code that expires in 10 minutes
- User enters the code → verified → can set a new password

### Database
Add a new table:
```
sms_verification_codes
- id (uuid, primary key)
- user_id (uuid, references users, not null)
- phone (text, not null)
- code (text, not null) — 6-digit numeric string
- purpose (text, not null) — 'password_reset', 'phone_verification', 'login_verification'
- expires_at (timestamp, not null) — 10 minutes from creation
- used (boolean, default false)
- attempts (integer, default 0) — track failed verification attempts
- created_at (timestamp)
```

### Frontend
- Add "Forgot password?" link on the Sign In page below the password field
- Clicking it goes to a `/auth/forgot-password` page with two options:
  - "Send reset link to my email" (uses magic link flow to a password reset page)
  - "Send code to my phone" (only shown if user has a phone on file — they enter their email first, then if a phone exists, this option appears)
- Create a `/auth/verify-sms` page: enter the 6-digit code, then set a new password
- Create a `/auth/reset-password` page: for email-based reset (token from magic link)

### Backend
- Create `POST /api/auth/forgot-password` endpoint:
  1. Receive email
  2. Look up user — if no user found, return generic "If an account exists, we'll send instructions" (don't reveal if email exists)
  3. Return whether the user has a phone on file (boolean `hasPhone`) so the frontend knows which options to show

- Create `POST /api/auth/forgot-password/email` endpoint:
  1. Generate a magic link token with purpose 'password_reset'
  2. Send email with reset link (or log to console for now)
  3. Link goes to `/auth/reset-password?token={token}`

- Create `POST /api/auth/forgot-password/sms` endpoint:
  1. Receive email
  2. Look up user and their phone number
  3. Generate a 6-digit code, store in sms_verification_codes
  4. Send SMS via Twilio (or log to console for now since Twilio isn't set up yet)
  5. Return success

- Create `POST /api/auth/verify-sms-code` endpoint:
  1. Receive email + code
  2. Look up the latest unused, non-expired code for this user
  3. If attempts > 5, return "Too many attempts, request a new code"
  4. If code matches: mark as used, return a temporary reset token
  5. If code doesn't match: increment attempts, return error

- Create `POST /api/auth/reset-password` endpoint:
  1. Receive token (from magic link or SMS verification) + new password
  2. Verify the token
  3. Update the user's password_hash
  4. Invalidate all existing sessions for this user
  5. Create a new session
  6. Return success + redirect to dashboard

### Phone Number Collection
- Add an optional "Phone number" field to the Sign Up page (not required, but encouraged with helper text: "Add your phone for account recovery")
- Add phone number to the Account settings page (placeholder for now)

### Rate Limiting
- Max 3 SMS codes per phone per 10 minutes
- Max 5 SMS codes per IP per hour

---

## Updated Sign In Page Layout

The sign-in page should look like this (top to bottom):

1. **"Continue with Google"** button (prominent, full-width)
2. **Divider** — "or" text with lines on each side
3. **"Sign in with email link"** — email input + send button (collapsible/expandable section)
4. **Divider** — "or sign in with password"
5. **Email + Password fields** + "Forgot password?" link
6. **Sign In button**
7. **"Don't have an account? Sign up"** link

## Updated Sign Up Page Layout

1. **"Continue with Google"** button
2. **Divider** — "or"
3. **Email, Password, Role selector, Phone (optional), Referral code (optional)**
4. **Sign Up button**
5. **"Already have an account? Sign in"** link

---

## What NOT To Do

- Do NOT remove or modify the existing email+password auth — it must continue to work
- Do NOT modify the communities/county data
- Do NOT modify dark mode
- Do NOT set up actual Resend or Twilio integrations — just log to console for now with clear TODO comments
- Do NOT add any features beyond auth
- Do NOT create the Google OAuth credentials — just make the code read from env vars
