# Weather App — Agent Rules

## Next.js Version Warning
Read `node_modules/next/dist/docs/` before writing any Next.js code. This is Next.js 16 — APIs, conventions, and file structure differ from your training data. Heed deprecation notices.

## Project Layout
- All source lives in `weather-app/` — run all commands from there.
- After any TypeScript change, run `npx tsc --noEmit` and fix all errors before declaring done.

## Data & APIs
- Open-Meteo is keyless — no API keys, no `.env` file needed.
- The `/api/forecast`, `/api/reverse`, and `/api/search` route handlers already exist. Do not duplicate them.
- SWR deduping interval is 5 minutes (`dedupingInterval: 300_000`). Do not change it without explicit instruction.

## State & Routing
- URL search params (`lat`, `lon`, `name`, `admin1`, `cc`) are the source of truth for location. Use `router.replace` to update location; do not introduce React state for lat/lon.

## Styling
- Tailwind v4 is active. Configure via `globals.css` `@theme` block, not `tailwind.config.js`.
- WMO weather gradients are raw CSS strings in `lib/wmo-codes.ts`. Keep them there — Tailwind JIT cannot process dynamic gradient class names.
- Dark mode is forced via `className="dark"` on `<html>`. Do not add a theme toggle or remove the class.
- Color tokens use OKLCH with hue 227 sky-blue tint. Do not reset them to achromatic (chroma 0).
- Never use `border-left` or `border-right` wider than 1px as a coloured accent stripe.
- Never use `background-clip: text` with a gradient (gradient text).

## Typography
- `--font-display` is Big Shoulders Display (condensed geometric). Use it for all large numbers and headings.
- `--font-sans` is Geist. Use it for all UI labels and body text.

## Icons & Images
- Meteocons animated SVGs live in `public/meteocons/`. Render them via `<WeatherIcon>` only.
- `next/image` must use `unoptimized` for Meteocons — it preserves SMIL animation.

## Animations
- `@keyframes float` and `@keyframes card-reveal` are defined in `globals.css`. Do not re-declare them inline.
- Animate only `transform` and `opacity`. Never animate layout properties.
- All animations must respect `prefers-reduced-motion`.

## Date & Time
- Use `formatDayName` (from `lib/units.ts`) for day labels — it uses `Date.UTC()` to prevent local-timezone day flips.
