# Feature Specifications

> Minimal feature set. Keep it simple. Each feature listed here should be implemented before adding anything new.

---

## MVP Features (Phase 1)

### F1 — Auth
- User can register with email + password
- User can log in / log out
- Protected screens redirect to login if not authenticated
- Anonymous browsing of restaurants allowed (no login required to view)

**Screens:** `(auth)/login.tsx`, `(auth)/register.tsx`

---

### F2 — Restaurant List (Home)
- Display a scrollable list of all restaurants
- Each card shows: name, address, average score, number of ratings
- Tap card → navigate to restaurant detail
- Floating action button (FAB) → add new restaurant (auth required)

**Screen:** `index.tsx`
**Component:** `components/restaurant-card.tsx`

---

### F3 — Map View
- Full-screen map with markers for all restaurants
- Marker tap → show restaurant name + score in a bottom sheet / callout
- Tap callout → navigate to restaurant detail
- Long-press on map → open "Add restaurant" form pre-filled with tapped coordinates (auth required)
- Free tiles (OpenStreetMap) with attribution shown

**Screen:** `map.tsx`
**Component:** `components/restaurant-map.tsx`

---

### F4 — Restaurant Detail
- Shows: name, address, map pin (small static map or inline map)
- Shows average score (star display) and all user ratings with notes
- If logged in: show a rate/edit button → opens rating form
- If user already rated: show their current rating with edit/delete option
- Bookmark toggle button (auth required)

**Screen:** `restaurant/[id].tsx`
**Components:** `components/ui/rating-stars.tsx`, `components/rating-form.tsx`

---

### F5 — Add / Edit Restaurant
- Form: Name (required), Address (optional), coordinates (auto-filled from map long-press or user location)
- On submit: insert into `restaurants` table, navigate to detail screen

**Screen:** `restaurant/new.tsx` (or modal)

---

### F6 — My Bookmarks (Explore tab)
- List of restaurants the current user has bookmarked
- Remove bookmark from list
- Auth required to view; shows empty state if not logged in

**Screen:** `explore.tsx`

---

## Out of Scope (Phase 1)

These features are explicitly NOT in the initial version:
- Social features (follow, share, comments)
- Photos / image upload
- Search by name or category
- Filters (cuisine type, rating range)
- Notifications / push
- Offline mode
- Admin panel

---

## UX Notes

- Use bottom sheets (not full-screen modals) for quick actions: rating form, "add restaurant" from map
- Confirm destructive actions (delete rating, delete restaurant) with an alert dialog
- Show loading skeletons while data is fetching, not spinners
- Handle empty states gracefully: "No restaurants yet. Be the first to add one!"
- Error states: show a retry button, not just an error message

---

## Navigation Flow

```
Tab Bar
├── Home (index)         → Restaurant List
│    └── [tap card]      → Restaurant Detail
│         └── [rate btn] → Rating Form (modal/sheet)
│    └── [FAB]           → Add Restaurant Form
│
├── Map (map)            → Map View
│    └── [marker tap]    → callout → Restaurant Detail
│    └── [long press]    → Add Restaurant Form (pre-filled coords)
│
└── Explore (explore)    → My Bookmarks
     └── [tap item]      → Restaurant Detail

Auth Flow (accessed from any protected action):
  → (auth)/login  ←→  (auth)/register
  → after login: return to previous screen
```
