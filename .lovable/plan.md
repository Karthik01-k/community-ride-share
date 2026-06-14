## Plan: RideBuddy logo + click-to-hero

### 1. Upload logo to CDN
- `lovable-assets create --file /mnt/user-uploads/ChatGPT_Image_Jun_14_2026_11_29_15_AM.png --filename ridebuddy-logo.png > src/assets/ridebuddy-logo.png.asset.json`

### 2. Create reusable `<BrandLogo />` component
- `src/components/BrandLogo.tsx`
- Renders the logo `<img>` (with alt "RideBuddy") wrapped in a button/link.
- Behavior on click:
  - If currently on `/` (Landing): smooth-scroll to `#hero`.
  - Otherwise: navigate to `/#hero`, which scrolls to hero after route loads.
- Accepts `className` + `size` (sm for header bar, md for sidebar) so it fits both placements.

### 3. Add `id="hero"` to the Landing hero section
- `src/pages/Landing.tsx` — add `id="hero"` to the existing `<section className="gradient-hero …">` so the anchor resolves.
- Add a small effect on Landing mount: if `location.hash === '#hero'`, scroll the element into view (handles cross-page navigation).

### 4. Replace brand text with logo
- **`src/components/AppSidebar.tsx`** — replace the current "Let's Raid" wordmark block with `<BrandLogo size="md" />`.
- **`src/components/AppLayout.tsx`** — add `<BrandLogo size="sm" />` to the top header (next to the menu/search area), replacing any "Let's Raid" text there.
- Remove remaining "Let's Raid" text strings throughout `Landing.tsx`, `Auth.tsx`, `index.html` `<title>` / meta, and the sidebar — replace with "RideBuddy".

### 5. SEO + favicon
- Update `index.html`: `<title>RideBuddy — Ride Smarter Across India</title>`, meta description, og:title, og:image (point to the new CDN URL).

### 6. Memory update
- Update `mem://index.md` Core line: brand is now **RideBuddy** (tagline kept). Add note that the clickable logo lives in sidebar header + top app header and scrolls to `#hero` on Landing.

### Out of scope
- No layout/color/theme changes — only logo swap + brand rename.
- No DB or auth changes.
