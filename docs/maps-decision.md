# Map Libraries — Decision Guide

> Status: **✅ DECIDED**
> Library: `@maplibre/maplibre-react-native` + OpenStreetMap tiles
> Restaurant data: OSM Overpass API (display) + Supabase (ratings & user contributions)

---

## Constraint

The map solution must be **completely free**, now and in the future:

- No API keys that start charging above a quota (unless a hard $0 spending cap is possible)
- Open-source tiles preferred (OpenStreetMap)
- Must support React Native (iOS + Android) via Expo managed/bare workflow

---

## Options Evaluated

### Option A — `react-native-maps` + OpenStreetMap tiles

| Factor  | Detail                                                                     |
| ------- | -------------------------------------------------------------------------- |
| Cost    | Free — OSM tiles are free, no key                                          |
| iOS     | Apple Maps by default (free), or custom tile URL                           |
| Android | Requires Google Maps SDK key ⚠️ (but $200/month free credit may be enough) |
| Styling | Limited                                                                    |
| Markers | Built-in                                                                   |
| Install | `npx expo install react-native-maps`                                       |
| Config  | `app.json` plugin: `"react-native-maps"`                                   |

**Risk:** Android needs Google Maps — requires billing enabled on GCP even for free tier. Hard limit not easily enforceable.

---

### Option B — `expo-maps` (Expo SDK 55, experimental)

| Factor    | Detail                                                                                      |
| --------- | ------------------------------------------------------------------------------------------- |
| Cost      | Uses platform native maps (Apple Maps free on iOS; Google Maps on Android — same risk as A) |
| Stability | Experimental — API may break                                                                |
| Markers   | Yes                                                                                         |
| Install   | Already available in Expo SDK 55                                                            |

**Risk:** Experimental. Android requires Google billing.

---

### Option C — `react-native-maplibre-gl` + free OSM/Maptiler tiles ✅ RECOMMENDED

| Factor     | Detail                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Cost       | Open source renderer (MapLibre). Tile provider: OSM (free) or Maptiler free tier (100k tiles/month) |
| iOS        | Yes                                                                                                 |
| Android    | Yes                                                                                                 |
| Styling    | Excellent — vector tiles, full GL style spec                                                        |
| Markers    | Yes (Callouts, custom icons)                                                                        |
| Clustering | Yes                                                                                                 |
| Install    | `npm install @maplibre/maplibre-react-native`                                                       |

**Recommended tile URL (OSM raster — fully free):**

```
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

Attribution required: `© OpenStreetMap contributors`

**No API key required for OSM raster tiles.**

---

### Option D — `@rnmapbox/maps` + Mapbox free tier

| Factor      | Detail                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| Cost        | 50,000 map loads/month free; requires API key                            |
| iOS/Android | Yes                                                                      |
| Styling     | Excellent                                                                |
| Risk        | Free tier is generous but not unlimited; could incur cost if usage grows |

---

## Decision: Option C — `@maplibre/maplibre-react-native` + OpenStreetMap

Zero cost, no API key, full vector tile support, clustering, iOS + Android.

---

## Restaurant Data Strategy

### Problem

The map library only renders tiles. Restaurant markers need a data source. Options:

- **Google Places / Yelp / TripAdvisor API** — paid or heavily rate-limited. ❌ Not free.
- **Web crawler** — violates ToS of most services. ❌ Legal risk.
- **100% user-generated** — empty map on first launch, poor UX. ❌ Cold-start problem.
- **OpenStreetMap Overpass API** — millions of restaurants worldwide, free, no key. ✅

### Chosen approach: Overpass API + Supabase hybrid

```
Map screen
├── Layer 1 — OSM Overpass API (read-only, no key required)
│    ├── Fetched by current map bounding box
│    ├── Cached in memory for the session (no Supabase write)
│    └── Displayed as grey markers
│
└── Layer 2 — Supabase `restaurants` table (user-generated)
     ├── Restaurants added by app users (not in OSM)
     ├── Displayed as branded markers (different color)
     └── All ratings and notes are always stored here

User flow:
  OSM restaurant tapped → user can "claim" it → creates Supabase record → can rate it
  Long-press on empty map → add new restaurant → stored in Supabase
```

### Overpass API query (bounding box)

```
[out:json][timeout:10];
(
  node["amenity"="restaurant"]({{bbox}});
  node["amenity"="cafe"]({{bbox}});
  node["amenity"="bar"]({{bbox}});
);
out body;
```

Endpoint: `https://overpass-api.de/api/interpreter`

- No API key
- No registration
- Rate limit: reasonable for per-gesture requests (do not poll on every render)
- Attribution required: `© OpenStreetMap contributors`

### Rules for Overpass usage

- Fetch only on map region change (debounce 500ms minimum)
- Do not fetch if zoom level < 13 (too many results)
- Cache results keyed by bounding box — do not re-fetch same area in same session
- Max 200 results per query (add `[out:json][timeout:10][maxsize:1000000]`)

---

## Implementation Checklist

- [ ] `npm install @maplibre/maplibre-react-native`
- [ ] Add plugin to `app.json` if required
- [ ] Create `src/lib/overpass.ts` — typed Overpass API client
- [ ] Create `src/components/restaurant-map.tsx` (Android/Web fallback)
- [ ] Create `src/components/restaurant-map.ios.tsx` (MapLibre, glass FAB)
- [ ] Add OSM attribution `© OpenStreetMap contributors` to map UI (legally required)
- [ ] Implement bounding-box debounce + cache in `src/hooks/use-map-restaurants.ts`
- [ ] Test on iOS simulator and Android emulator
