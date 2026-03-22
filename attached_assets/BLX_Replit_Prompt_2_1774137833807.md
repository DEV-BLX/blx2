# BLX Prompt #2 — Seed US Counties + Dark Mode

This is a follow-up to the foundation build. Do NOT modify any existing functionality — only ADD what's specified here. When finished, stop and ask me for next steps.

---

## Part A: Seed US Counties into Communities Table

The `communities` table already exists in the database schema. Seed it with ALL US counties (~3,143 counties + territories/equivalents, roughly 3,200 total).

### Data Source

Fetch or generate US county data from public Census Bureau FIPS codes. Each county needs:

- **name**: County name without "County" suffix for most states (e.g., "Harris", "Montgomery"). Keep "Parish" for Louisiana, "Borough" for Alaska, etc. where that's the official name.
- **state**: Two-letter state abbreviation (e.g., "TX", "CA")
- **display_name**: Format as "[Name] County, [State]" — e.g., "Harris County, TX", "Montgomery County, TX". For Louisiana use "Parish" instead of "County". For Alaska boroughs, use "Borough". For independent cities (like in Virginia), just use "[City], VA".
- **fips_code**: 5-digit FIPS code as string (e.g., "48339" for Montgomery County, TX)
- **is_county**: `true`
- **is_custom**: `false`
- **latitude**: Approximate centroid latitude (decimal)
- **longitude**: Approximate centroid longitude (decimal)
- **status**: `'active'`

### How to Get the Data

Option 1 (preferred): Download a public FIPS dataset CSV and parse it. Good sources:
- https://www2.census.gov/geo/docs/reference/codes2020/national_county2020.txt
- Or use a well-known npm package like `us-counties` or similar

Option 2: Generate INSERT statements from a known dataset. The data is public domain US government data.

### Important Rules

- Do NOT create a separate counties table. Use the EXISTING `communities` table.
- Each county row should have `is_county = true` and `is_custom = false`.
- Make sure there are no duplicates (unique constraint on fips_code).
- After seeding, verify the count is approximately 3,143-3,250 rows.
- Log the final count after seeding.
- Include all 50 states + DC + US territories (Puerto Rico, Guam, US Virgin Islands, American Samoa, Northern Mariana Islands) if they have county-equivalent FIPS codes.

### Future Note (do NOT build now)

A `zip_codes` table will be added later to map ZIP codes to communities for location auto-detection. Do not create this table now — just be aware the communities table will be used for ZIP-based lookups in the future.

---

## Part B: Dark Mode

Add a dark mode toggle to the app. This should work alongside the existing BLX brand colors.

### Requirements

1. **Toggle button** in the header (top right area, near any user menu). Use a sun/moon icon. Clicking toggles between light and dark mode.

2. **Persist the preference** in localStorage so it survives page refreshes and revisits.

3. **Default to system preference** — if the user hasn't explicitly toggled, follow their OS/browser dark mode setting (`prefers-color-scheme: dark`).

4. **Tailwind dark mode** — configure Tailwind to use `class` strategy (not `media`), so we control dark mode via a `dark` class on the `<html>` element.

5. **Dark mode color scheme using BLX brand colors:**

   **Light mode (existing):**
   - Background: White (#FFFFFF)
   - Surface/cards: Light gray (#F5F5F5 or similar)
   - Text primary: Charcoal (#2D2926)
   - Text secondary: Coffee Brown (#6B5B4F)
   - Header: Navy Blue (#244574)
   - Accents: Gold (#EBCB68), Fox Orange (#C87540)
   - Success: Dusty Sage (#7A8B6E)
   - Error: Terracotta Red (#B85C4D)

   **Dark mode:**
   - Background: Dark charcoal (#1A1A1A or #121212)
   - Surface/cards: Slightly lighter (#1E1E1E or #2D2926)
   - Text primary: White (#FFFFFF) or off-white (#E8E8E8)
   - Text secondary: Muted gold (#D4C08A) or light coffee (#A89888)
   - Header: Deeper navy (#1A2F4A) or keep Navy Blue (#244574)
   - Accents: Same Gold (#EBCB68), Fox Orange (#C87540) — these pop nicely on dark backgrounds
   - Success: Dusty Sage (#7A8B6E) — works on both
   - Error: Terracotta Red (#B85C4D) — works on both

6. **Apply dark mode classes** to ALL existing pages and components:
   - The home page
   - Sign in / sign up pages
   - All placeholder "Coming Soon" pages
   - The header and navigation
   - The mobile hamburger menu
   - Any cards, buttons, inputs, and form elements

7. **Make it look premium** — dark mode should feel intentional and polished, not just "inverted colors." Neumorphic-style subtle shadows work well in dark mode (soft light/dark shadow pairs against the dark surface).

### What NOT to Do

- Do NOT change the existing light mode colors or layout
- Do NOT modify the database schema
- Do NOT touch auth logic
- Do NOT add any new pages or features beyond the dark mode toggle
