# Meal Scamp

A self-hosted PWA to plan meals, auto-generate shopping lists, track Bright-Line-style success, and log flexible weekly workouts. Built with SvelteKit + Tailwind. Reverse-proxy with Caddy.

## Features
- Weekly planner with batch-prep counts
- Aggregated shopping list
- Recipe cards with hand-portion visuals
- 30-day punch card tracker
- Weekly workout category tracker
- Pushover reminders (API)
- Offline-capable PWA (basic cache)

## Quick Start
```bash
npm i
cp .env.example .env  # add Pushover keys (optional)
npm run dev
# in another shell
caddy run --config Caddyfile
```

## Build & Deploy (Node adapter)
```bash
npm run build
node www/index.js
```

Systemd unit included: `meal-scamp.service`

## Data
Edit `src/lib/data/seed-meals.json` (import your 30-meal catalog).

## Notes
- All state persists to local storage by default.
- Add Supabase later if you want multi-device sync.
- Caddyfile assumes domain `meal-scamp.tibocin.xyz`; adjust as needed.
- Application now serves from `www/` folder on port 3003.
