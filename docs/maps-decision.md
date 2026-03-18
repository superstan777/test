# Map Libraries — Decision Guide

> Status: **OPEN — no decision made yet**
> Update this file and root `CLAUDE.md` when a library is chosen.

---

## Constraint

The map solution must be **completely free**, now and in the future:
- No API keys that start charging above a quota (unless a hard $0 spending cap is possible)
- Open-source tiles preferred (OpenStreetMap)
- Must support React Native (iOS + Android) via Expo managed/bare workflow

---

## Options Evaluated

### Option A — `react-native-maps` + OpenStreetMap tiles

| Factor | Detail |
|---|---|
| Cost | Free — OSM tiles are free, no key |
| iOS | Apple Maps by default (free), or custom tile URL |
| Android | Requires Google Maps SDK key ⚠️ (but $200/month free credit may be enough) |
| Styling | Limited |
| Markers | Built-in |
| Install | `npx expo install react-native-maps` |
| Config | `app.json` plugin: `"react-native-maps"` |

**Risk:** Android needs Google Maps — requires billing enabled on GCP even for free tier. Hard limit not easily enforceable.

---

### Option B — `expo-maps` (Expo SDK 55, experimental)

| Factor | Detail |
|---|---|
| Cost | Uses platform native maps (Apple Maps free on iOS; Google Maps on Android — same risk as A) |
| Stability | Experimental — API may break |
| Markers | Yes |
| Install | Already available in Expo SDK 55 |

**Risk:** Experimental. Android requires Google billing.

---

### Option C — `react-native-maplibre-gl` + free OSM/Maptiler tiles ✅ RECOMMENDED

| Factor | Detail |
|---|---|
| Cost | Open source renderer (MapLibre). Tile provider: OSM (free) or Maptiler free tier (100k tiles/month) |
| iOS | Yes |
| Android | Yes |
| Styling | Excellent — vector tiles, full GL style spec |
| Markers | Yes (Callouts, custom icons) |
| Clustering | Yes |
| Install | `npm install @maplibre/maplibre-react-native` |

**Recommended tile URL (OSM raster — fully free):**
```
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```
Attribution required: `© OpenStreetMap contributors`

**No API key required for OSM raster tiles.**

---

### Option D — `@rnmapbox/maps` + Mapbox free tier

| Factor | Detail |
|---|---|
| Cost | 50,000 map loads/month free; requires API key |
| iOS/Android | Yes |
| Styling | Excellent |
| Risk | Free tier is generous but not unlimited; could incur cost if usage grows |

---

## Recommendation

**Use Option C (`react-native-maplibre-gl` + OpenStreetMap tiles)** if the priority is zero ongoing cost with no API key.

**Use Option D (`@rnmapbox/maps`)** if you need better styling and can accept a soft 50k MAU limit.

---

## Implementation Checklist (once decided)

- [ ] Install the chosen library
- [ ] Add required `app.json` plugin entry
- [ ] Create `src/components/restaurant-map.tsx` with the `RestaurantMapProps` interface (see `src/CLAUDE.md`)
- [ ] Add OSM attribution text to the map screen UI (legally required)
- [ ] Test on iOS simulator and Android emulator
- [ ] Update `CLAUDE.md` → Open Decisions section
- [ ] Update `src/CLAUDE.md` → Map Integration section
- [ ] Delete/archive this file or mark it as resolved
