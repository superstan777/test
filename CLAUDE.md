# CLAUDE.md — Project Instructions for AI Agents

> Read this file before making any changes. It is the single source of truth for the project's architecture, tech stack, and conventions.

---

## Project Overview

**Restaumat** — a mobile app for discovering, bookmarking, and rating restaurants.

**Goals:**
- Users can browse restaurants on an interactive map
- Users can add personal notes and ratings to restaurants
- Simple, focused UX — no feature bloat
- Completely free to run, forever (no paid tiers, no paid APIs)

**Platform:** iOS + Android (React Native / Expo)

---

## Tech Stack (Decided)

| Layer | Technology | Reason |
|---|---|---|
| Framework | [Expo](https://expo.dev) ~55 + expo-router ~55 | File-based routing, managed workflow, OTA updates |
| Language | TypeScript (strict) | Type safety |
| Styling | [NativeWind](https://www.nativewind.dev) v4 | Tailwind CSS utilities on React Native |
| Backend | [Supabase](https://supabase.com) | Free tier: auth, Postgres, storage, realtime |
| Navigation | expo-router (file-based) + `NativeTabs` | Already in project |
| State | React Context + `useState` / `useReducer` | Keep it simple; no Redux |
| Maps | **⚠️ OPEN DECISION** — see below | |

---

## Open Decisions

### Maps library
No decision made yet. Evaluate options based on: free tier, no API key required (or generous free quota), React Native support.

**Candidates to evaluate:**
- `react-native-maps` with OpenStreetMap tiles — fully free, no key needed, limited styling
- `expo-maps` (experimental, Expo SDK 55) — requires Google Maps / Apple Maps (free on iOS; Android SDK key needed)
- `react-native-maplibre-gl` with free Maptiler/OSM tiles — open source, better styling, more complex setup
- `@rnmapbox/maps` with Mapbox free tier — 50k MAU free, requires API key

**Constraint:** Must remain free. Do not use Google Maps Billing or any API that charges after a free quota unless it has a hard cap (spending limit = $0).

When a decision is made, update this file and `src/CLAUDE.md`.

---

## Architecture Overview

```
User ──► Expo App (React Native)
              │
              ├── expo-router screens (src/app/)
              ├── NativeWind styled components (src/components/)
              ├── Supabase client (src/lib/supabase.ts)
              └── Map screen (src/app/map.tsx)  ← to be created
              
Supabase
  ├── Auth (email/password, anonymous optional)
  ├── Database (Postgres)
  │     ├── restaurants (id, name, lat, lng, address, created_by, created_at)
  │     ├── ratings     (id, restaurant_id, user_id, score 1-5, note, created_at)
  │     └── bookmarks   (id, restaurant_id, user_id, created_at)
  └── Row Level Security — always enabled on every table
```

---

## Free-Tier Constraints

### Supabase free tier limits
- 500 MB database storage
- 1 GB file storage  
- 50,000 monthly active users
- 2 projects max

**Rules:**
- Never store large blobs (images, binary) directly in Postgres — use Supabase Storage
- Enable RLS on every table before inserting any data
- Do not enable Supabase Realtime unless the feature explicitly needs it (it costs resources)

### Maps free-tier rules
- Do not request map tiles on every render — cache where possible
- Do not make more than 1 geocoding/reverse-geocoding request per user action

---

## Repository Structure

```
/
├── CLAUDE.md              ← you are here
├── app.json               ← Expo config
├── package.json
├── tsconfig.json
├── assets/                ← static assets (icons, images)
└── src/
    ├── CLAUDE.md          ← frontend-specific conventions
    ├── app/               ← expo-router screens (file = route)
    │   ├── _layout.tsx    ← root layout, ThemeProvider
    │   ├── index.tsx      ← Home tab
    │   ├── explore.tsx    ← Explore tab
    │   └── map.tsx        ← Map screen (to be created)
    ├── components/        ← reusable UI components
    ├── constants/
    │   └── theme.ts       ← color palette, spacing tokens
    ├── hooks/             ← custom React hooks
    ├── lib/               ← third-party client singletons (to be created)
    │   └── supabase.ts    ← Supabase client
    └── global.css         ← NativeWind / Tailwind CSS config
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm start           # Expo Go / dev client
npm run ios         # iOS simulator
npm run android     # Android emulator

# Lint
npm run lint
```

---

## Environment Variables

Store secrets in `.env.local` (never commit). Use `expo-constants` or `EXPO_PUBLIC_` prefix for client-side variables.

Required variables:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Code Conventions

- **Path aliases:** `@/` → `src/`, `@/assets/` → `assets/`
- **TypeScript:** strict mode, no `any`, no `@ts-ignore`
- **Components:** named exports only (no default export from component files, except screen files in `src/app/` which expo-router requires as default)
- **Styling:** NativeWind `className` prop — no inline `style` objects unless unavoidable (e.g. dynamic calculated values)
- **Supabase calls:** always check `.error` and handle it — never silently swallow errors
- **RLS:** never bypass RLS with `service_role` key on the client — `service_role` is back-end only
- **Commits:** conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)

---

## What NOT to Do

- Do not add Redux, Zustand, Jotai, or other global state libraries unless complexity truly demands it
- Do not add `react-query` / `@tanstack/query` yet — use `useEffect` + `useState` until patterns stabilize
- Do not add paid map APIs without a hard $0 spending limit configured
- Do not store user passwords — Supabase Auth handles credentials
- Do not enable Supabase `service_role` key in the mobile app bundle
- Do not use `expo-router/unstable-*` APIs in production-critical paths (already used in tabs — acceptable for now)
