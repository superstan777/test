# Feature Specifications

> Minimal feature set. Keep it simple. Each feature listed here should be implemented before adding anything new.

---

## App Vision

**Personal food diary with a full-screen map.**

- Map takes the entire screen — it is the core UI, not a feature
- Bottom tab bar floats over the map with a **Liquid Glass** effect (iOS) or translucent fallback (Android)
- 3 tabs only: **Map**, **Visits**, **Want to Go**
- Phase 1: personal only (your own data)
- Phase 2 (future): add friends, see where they went and what they rated

---

## Tab Structure

```
┌─────────────────────────────┐
│                             │
│     Full-screen Map         │
│   (MapLibre + OSM tiles)    │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│  🗺 Map  │ ✓ Visits │ 🔖 Want │  ← Liquid Glass tab bar
└─────────────────────────────┘
```

---

## MVP Features (Phase 1)

### F1 — Auth

- Register with email + password
- Log in / log out
- Profile screen: shows email + logout button (nothing else in Phase 1)
- Protected actions (rate, add restaurant, want-to-go) redirect to login
- Anonymous browsing of the map is allowed without login

**Screens:** `(auth)/login.tsx`, `(auth)/register.tsx`, `profile.tsx` (accessible from any tab header)

---

### F2 — Map (tab 1 — default tab)

- Full-screen `MapLibre` map covering 100% of the screen
- Tab bar floats over the bottom of the map (absolute position)
- Markers for **all** restaurants fetched from OSM Overpass API
- Markers for user-added restaurants (Supabase) shown with a distinct color
- Tap marker → bottom sheet slides up showing: name, your rating (if any), "Rate" / "Want to Go" buttons
- Long-press on empty map area → "Add restaurant" form, coordinates pre-filled
- OSM attribution `© OpenStreetMap contributors` always visible (bottom-left, above tab bar)
- FAB (floating action button, glass style on iOS) in top-right corner → "Add restaurant"

**Screen:** `index.tsx` (default tab = map)
**Components:** `restaurant-map.tsx`, `restaurant-map.ios.tsx`, `map-fab.tsx`, `map-bottom-sheet.tsx`

---

### F3 — Visits (tab 2)

- Scrollable list of restaurants the current user has **already rated**
- Each card shows: restaurant name, address (if available), star rating (1-5), note excerpt
- Sorted by most recently visited (by `rating.created_at` desc)
- Tap card → Restaurant Detail screen
- Empty state: "No visits yet. Tap a restaurant on the map to rate it."
- Requires login; if not logged in → show login prompt

**Screen:** `visits.tsx`
**Component:** `restaurant-card.tsx`

---

### F4 — Want to Go (tab 3)

- Scrollable list of restaurants the user has bookmarked
- Each card shows: restaurant name, address (if available), distance from current location (if permission granted)
- Tap card → Restaurant Detail screen
- Swipe to remove from list (or remove button on card)
- Empty state: "Nothing saved yet. Long-press any restaurant on the map to save it."
- Requires login; if not logged in → show login prompt

**Screen:** `want-to-go.tsx`
**Component:** `restaurant-card.tsx` (reused)

---

### F5 — Restaurant Detail (modal / sheet)

- Accessible by tapping a marker callout or a card in Visits/Want to Go
- Shows: name, address, star average, number of ratings
- **Your rating section:**
  - Not rated yet → "Rate this place" button → opens Rating Form
  - Already rated → shows your stars + note, with Edit / Delete options
- **Want to Go toggle** — bookmark/unbookmark
- Does NOT show other users' ratings in Phase 1 (personal diary only)

**Screen:** `restaurant/[id].tsx`
**Components:** `ui/rating-stars.tsx`, `rating-form.tsx`

---

### F6 — Rating Form (bottom sheet)

- Star picker: 1–5 stars (tap to select)
- Note field: free text, **max 100 characters**, character counter shown
- Submit → saves to `ratings` table, closes sheet, updates marker/card
- Edit mode: pre-fills existing rating, submit = upsert

**Component:** `rating-form.tsx` (bottom sheet, not full screen)

---

### F7 — Add Restaurant Form

- Triggered by: long-press on map or FAB
- Fields: Name (required), Address (optional, text only)
- Coordinates: auto-filled from tap position or current GPS location
- Submit → inserts into `restaurants` table, drops marker on map

**Screen:** `restaurant/new.tsx` (modal)

---

## Out of Scope (Phase 1)

| Feature                                            | Phase  |
| -------------------------------------------------- | ------ |
| Friends / social sharing                           | 2      |
| Map layer toggle (all vs friends' visited)         | 2      |
| User profile stats (total visits, avg score given) | 2      |
| Photos / image upload                              | 2      |
| Search by name or cuisine                          | future |
| Filters (rating range, cuisine type)               | future |
| Notifications / push                               | future |
| Offline mode                                       | future |

---

## UX Rules

- Map is **always** the default tab and takes 100% of screen height — no header bar on map screen
- Tab bar **floats** over map content (absolute positioned, NOT in a safe-area footer)
- Bottom sheets for: rating form, restaurant detail, add restaurant — never full-screen push for quick actions
- Confirm destructive actions (delete rating, delete restaurant) with an `Alert.alert()` dialog
- Loading: skeleton placeholders in lists, spinner overlay on form submit
- Empty states: clear message + contextual CTA (e.g. "Go to map" button from Visits empty state)
- Note max length: 100 characters — enforce with `maxLength` prop + live counter (`74/100`)
- Star rating: tap interaction only — no half stars

---

## Navigation Flow

```
Bottom Tab Bar (floating, Liquid Glass)
├── Map (index — default)
│    ├── [marker tap]       → MapBottomSheet (slide up)
│    │    ├── [Rate]        → RatingForm (sheet)
│    │    ├── [Want to Go]  → toggles bookmark
│    │    └── [Details]     → restaurant/[id]
│    ├── [long press map]   → restaurant/new (modal)
│    └── [FAB]              → restaurant/new (modal)
│
├── Visits
│    └── [tap card]         → restaurant/[id]
│
└── Want to Go
     └── [tap card]         → restaurant/[id]

Restaurant Detail (restaurant/[id])
  └── [Rate / Edit]         → RatingForm (sheet, within same screen)

Auth (triggered by any protected action)
  (auth)/login  ←→  (auth)/register
  → after login: back to triggering screen

Profile (header button, any tab)
  → profile.tsx  →  logout
```
