# Progress — Restaumat

> This file is the **live status document** for Restaumat development.
>
> **AI agent instructions:** Read this file at the start of every session. Update it when you complete a chunk or make a significant decision. It is the canonical source of "where we are".

---

## Current Status

**Active chunk:** Chunk 1 — Database & Auth  
**Build state:** ✅ iOS native build works (`npx expo run:ios` succeeds, app launches)  
**Last updated:** 2026-03-18

---

## How We Work

Work is divided into **chunks** — vertical slices of functionality, each small enough to complete in a single focused session. Every chunk has:

- A clear goal (one sentence)
- A checklist of tasks
- Acceptance criteria ("done when…")

### Session protocol

1. Read `docs/progress.md` — understand current chunk and status
2. Read `CLAUDE.md` and `src/CLAUDE.md` for conventions
3. Complete the tasks in the active chunk
4. Update this file: mark tasks done, note any decisions made
5. If the chunk is finished, mark it complete and set the next chunk as active

---

## Chunk Log

### ✅ Chunk 0 — Foundation

**Goal:** Bootstrap the project with all required dependencies and a working 3-tab skeleton.

- [x] Expo SDK ~55 + expo-router ~55 + TypeScript strict
- [x] NativeWind v4 + Tailwind CSS v3 configured (`babel.config.js`, `metro.config.js`, `tailwind.config.js`)
- [x] `@maplibre/maplibre-react-native` installed + `app.json` plugin added
- [x] `@supabase/supabase-js` + `@react-native-async-storage/async-storage` + `expo-secure-store` installed
- [x] `src/lib/supabase.ts` — Supabase client singleton
- [x] `src/types/restaurant.ts` + `src/types/rating.ts` — shared TypeScript types
- [x] `src/app/index.tsx` — full-screen MapLibre map (with Expo Go fallback)
- [x] `src/app/visits.tsx` — empty state screen
- [x] `src/app/want-to-go.tsx` — empty state screen
- [x] `src/components/app-tabs.tsx` — 3-tab layout: Map / Visits / Want to Go
- [x] All documentation files written (`CLAUDE.md`, `src/CLAUDE.md`, `docs/*.md`)
- [x] iOS native build succeeds on Xcode 16.3 / Swift 6.1

**Done:** App builds and runs. Map renders OSM tiles. Tab bar navigates between 3 screens.

---

### 🔄 Chunk 1 — Database & Auth

**Goal:** Users can register, log in, and log out. Supabase schema is live with RLS.

#### Tasks

- [ ] **1a — Supabase schema** — run SQL from `docs/database-schema.md` in Supabase dashboard  
      _Tables: `restaurants`, `ratings`, `bookmarks` — all with RLS enabled_
- [ ] **1b — Auth layout** — create `src/app/(auth)/_layout.tsx` (stack navigator, no tab bar)
- [ ] **1c — Login screen** — `src/app/(auth)/login.tsx`  
      _Email + password form, link to register, Supabase `signInWithPassword`_
- [ ] **1d — Register screen** — `src/app/(auth)/register.tsx`  
      _Email + password + confirm, Supabase `signUp`_
- [ ] **1e — Auth context** — `src/context/auth-context.tsx`  
      _Wraps app in `AuthProvider`, exposes `user`, `signIn`, `signOut` — no Redux_
- [ ] **1f — Root layout guard** — in `src/app/_layout.tsx`, redirect unauthenticated users to `/(auth)/login` when they attempt protected actions
- [ ] **1g — Profile screen** — `src/app/profile.tsx`  
      _Shows email, Logout button (calls `signOut`), accessible from tab header_

#### Acceptance criteria

- User can register with email + password and is created in Supabase Auth
- User can log in; session persists across app restarts (AsyncStorage)
- User can log out; redirected to login screen
- Map tab is accessible without login (anonymous browsing)
- TypeScript: `npx tsc --noEmit` reports zero errors

#### Notes / decisions made

_(empty — fill in as you work)_

---

### ⬜ Chunk 2 — Map Restaurants (OSM + Markers)

**Goal:** The map shows restaurant markers fetched from OSM Overpass API with caching.

#### Tasks

- [ ] **2a — Overpass hook** — `src/hooks/use-map-restaurants.ts`  
      _Input: bounding box. Output: `Restaurant[]`. Debounce ≥500ms. Cache per bbox. Skip zoom < 13._
- [ ] **2b — Marker component** — `src/components/restaurant-marker.tsx`  
      _OSM restaurants: blue pin. User-added (Supabase): orange pin. Tap → callback._
- [ ] **2c — Map region listener** — in `index.tsx`, listen to `onRegionDidChange` → trigger hook → render markers
- [ ] **2d — User-added restaurants overlay** — fetch from Supabase `restaurants` table for the visible bbox, merge with OSM results
- [ ] **2e — OSM attribution** — `© OpenStreetMap contributors` pinned bottom-left, above tab bar, always visible

#### Acceptance criteria

- Markers appear when map is zoomed in (zoom ≥ 13) over an area with restaurants
- No re-fetch for a bbox already loaded this session (cache works)
- Overpass is not called more than once per 500ms regardless of map movement
- Attribution text is visible at all times

---

### ⬜ Chunk 3 — Restaurant Detail & Rating

**Goal:** Tap a marker → see restaurant info. Rate it with stars + a note.

#### Tasks

- [ ] **3a — Map bottom sheet** — `src/components/map-bottom-sheet.tsx`  
      _Slides up on marker tap. Shows: name, address, your rating (if any), action buttons (Rate / Want to Go / Details)._
- [ ] **3b — Restaurant detail screen** — `src/app/restaurant/[id].tsx`  
      _Name, address, your rating section, Want to Go toggle. No other users' ratings (Phase 1)._
- [ ] **3c — Rating stars component** — `src/components/ui/rating-stars.tsx`  
      _Tap to select 1–5. No half stars. Reusable (display-only mode + interactive mode)._
- [ ] **3d — Rating form** — `src/components/rating-form.tsx`  
      _Bottom sheet. Star picker + note field (max 100 chars, live counter). Submit → upsert to `ratings` table._
- [ ] **3e — Delete rating** — confirm with `Alert.alert`, then delete from Supabase, update UI

#### Acceptance criteria

- Tapping a marker shows the bottom sheet with correct restaurant info
- Logged-in user can submit a 1–5 star rating with an optional note
- Rating appears in the Visits tab immediately after submission
- Edit and delete work correctly; deleted rating disappears from Visits
- Note field enforces 100-char max with live counter

---

### ⬜ Chunk 4 — Lists (Visits & Want to Go)

**Goal:** Visits and Want to Go tabs show real data from Supabase.

#### Tasks

- [ ] **4a — Restaurant card component** — `src/components/restaurant-card.tsx`  
      _Reusable. Shows: name, address, stars (Visits) or distance (Want to Go), note excerpt._
- [ ] **4b — Visits data** — in `visits.tsx`, fetch `ratings` joined with `restaurants` for the current user, sorted by `created_at` desc
- [ ] **4c — Want to Go data** — in `want-to-go.tsx`, fetch `bookmarks` joined with `restaurants`, with distance if location permission granted
- [ ] **4d — Bookmark toggle** — `src/hooks/use-bookmark.ts` — add/remove bookmark, optimistic UI
- [ ] **4e — Tap card → detail** — navigate to `restaurant/[id]` from both lists
- [ ] **4f — Empty states** — proper messages with CTA: "Go to map" from both empty states

#### Acceptance criteria

- After rating a restaurant, it appears at the top of Visits
- After bookmarking, it appears in Want to Go
- Swipe-to-delete (or button) removes a bookmark from the list (with `Alert.alert` confirm)
- Tapping any card navigates to the detail screen

---

### ⬜ Chunk 5 — Add Restaurant

**Goal:** Users can add restaurants not in OSM (long-press map or FAB).

#### Tasks

- [ ] **5a — FAB component** — `src/components/map-fab.tsx` (glass on iOS, solid on Android)  
      _Top-right corner of map. Taps open Add Restaurant form._
- [ ] **5b — Add restaurant form** — `src/app/restaurant/new.tsx` (modal screen)  
      _Fields: Name (required), Address (optional). Coordinates auto-filled._
- [ ] **5c — Long-press on map** → save tapped coordinates → open `restaurant/new` with coords pre-filled
- [ ] **5d — Insert to Supabase** → new marker appears on map (orange pin) immediately

#### Acceptance criteria

- FAB is visible on map tab, tapping it opens the form
- Long-press on map pre-fills coordinates in the form
- Submitted restaurant appears as an orange marker on the map
- Form validates: Name is required

---

### ⬜ Chunk 6 — Polish & Liquid Glass

**Goal:** Final visual polish. Liquid Glass tab bar on iOS.

#### Tasks

- [ ] **6a — Liquid Glass tab bar** — `src/components/app-tabs.ios.tsx`  
      _Use `expo-ui` SwiftUI Host. See `docs/liquid-glass.md`. Fallback: existing `app-tabs.tsx`._
- [ ] **6b — Liquid Glass FAB** — `src/components/map-fab.ios.tsx` (glass variant)
- [ ] **6c — Loading skeletons** — in Visits and Want to Go lists while fetching
- [ ] **6d — Form submit spinners** — overlay while Supabase calls are in flight
- [ ] **6e — Error handling audit** — all Supabase `.error` cases show user-facing messages (not silent)
- [ ] **6f — Android smoke test** — `npx expo run:android`, fix any Android-specific layout issues

#### Acceptance criteria

- Tab bar has Liquid Glass effect on iOS (real device or simulator with iOS 18+)
- Loading states are visible; no blank screens during fetches
- All Supabase errors surface a readable error message to the user
- App runs on Android without crashes

---

## Known Issues / Deferred Decisions

| ID  | Issue                                                                             | Status            |
| --- | --------------------------------------------------------------------------------- | ----------------- |
| I-1 | iOS build required Swift 6.1 + Xcode 16.3 — tracked in Podfile `post_install` fix | Resolved          |
| I-2 | MapLibre not available in Expo Go — graceful fallback in `index.tsx`              | Resolved          |
| I-3 | `expo-ui` Liquid Glass requires `expo-dev-client` native build, not Expo Go       | Noted             |
| I-4 | Supabase schema not yet applied to the project dashboard                          | Pending (Chunk 1) |

---

## Files Created / Modified

| Path                                   | Status     | Notes                                     |
| -------------------------------------- | ---------- | ----------------------------------------- |
| `src/app/index.tsx`                    | ✅ Done    | Full-screen map, Expo Go fallback         |
| `src/app/visits.tsx`                   | Stub       | Empty state only — data in Chunk 4        |
| `src/app/want-to-go.tsx`               | Stub       | Empty state only — data in Chunk 4        |
| `src/app/_layout.tsx`                  | ✅ Done    | Root layout with NativeWind ThemeProvider |
| `src/components/app-tabs.tsx`          | ✅ Done    | 3 tabs (Map/Visits/Want to Go)            |
| `src/lib/supabase.ts`                  | ✅ Done    | Client singleton                          |
| `src/types/restaurant.ts`              | ✅ Done    | `Restaurant` type                         |
| `src/types/rating.ts`                  | ✅ Done    | `Rating` type                             |
| `src/context/auth-context.tsx`         | ❌ Not yet | Chunk 1                                   |
| `src/hooks/use-map-restaurants.ts`     | ❌ Not yet | Chunk 2                                   |
| `src/components/restaurant-marker.tsx` | ❌ Not yet | Chunk 2                                   |
| `src/components/map-bottom-sheet.tsx`  | ❌ Not yet | Chunk 3                                   |
| `src/components/rating-form.tsx`       | ❌ Not yet | Chunk 3                                   |
| `src/components/ui/rating-stars.tsx`   | ❌ Not yet | Chunk 3                                   |
| `src/components/restaurant-card.tsx`   | ❌ Not yet | Chunk 4                                   |
| `src/components/map-fab.tsx`           | ❌ Not yet | Chunk 5                                   |
