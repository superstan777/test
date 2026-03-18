# CLAUDE.md — Frontend Source Conventions

> This file applies to everything inside `src/`. Read in addition to the root `CLAUDE.md`.

---

## Directory Map

```
src/
├── app/            expo-router screens — each file = one route
├── components/     shared UI components
│   └── ui/         primitive/generic components (no business logic)
├── constants/      design tokens (theme.ts)
├── hooks/          custom React hooks (use-*.ts)
├── lib/            third-party singletons
│   └── supabase.ts (to be created)
└── global.css      NativeWind/Tailwind config entry point
```

---

## Routing (expo-router)

- All screens live in `src/app/`
- File name = URL segment = tab name
- Layouts use `_layout.tsx`
- Tabs are defined in `src/components/app-tabs.tsx` (or `app-tabs.web.tsx` for web)
- Use `expo-router` `Link`, `useRouter`, `useLocalSearchParams` — never `react-navigation` directly

**Planned routes:**
| File | Purpose |
|---|---|
| `src/app/index.tsx` | Home / list of saved restaurants |
| `src/app/map.tsx` | Map with all restaurants |
| `src/app/explore.tsx` | Discover / search restaurants |
| `src/app/restaurant/[id].tsx` | Restaurant detail + rating form |
| `src/app/(auth)/login.tsx` | Login screen |
| `src/app/(auth)/register.tsx` | Register screen |

---

## Styling Rules (NativeWind v4)

NativeWind lets you use Tailwind `className` directly on React Native components.

```tsx
// ✅ correct
<View className="flex-1 bg-white px-4 pt-6">
  <Text className="text-lg font-semibold text-gray-900">Hello</Text>
</View>

// ❌ avoid — use className instead
<View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 16 }}>
```

**Exceptions where `style` is acceptable:**
- Dynamically calculated numeric values (e.g. map height from `useWindowDimensions`)
- Animated values from `react-native-reanimated`

**Color palette:** use tokens from `src/constants/theme.ts` for brand colors. Tailwind `gray-*`, `white`, `black` are fine directly.

**Dark mode:** use NativeWind's `dark:` prefix. Detect scheme with `src/hooks/use-color-scheme.ts`.

---

## Component Conventions

### File structure
```
src/components/
├── restaurant-card.tsx       ← domain component
├── restaurant-card.web.tsx   ← web override (if needed)
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   └── rating-stars.tsx
```

### Component template
```tsx
import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
};

export function MyComponent({ title, onPress }: Props) {
  return (
    <View className="rounded-xl bg-white p-4 shadow-sm">
      <Text className="text-base font-medium text-gray-800">{title}</Text>
    </View>
  );
}
```

- **Named exports** for all components
- **Default exports** only for `src/app/*.tsx` (expo-router requirement)
- No `React.FC` — type the props explicitly
- Keep components small — if JSX exceeds ~80 lines, split into sub-components

---

## Data Fetching (Supabase)

Use the singleton from `src/lib/supabase.ts`:

```ts
import { supabase } from '@/lib/supabase';
```

### Pattern for screen-level data fetching
```tsx
const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
const [loading, setLoading] = React.useState(true);
const [error, setError] = React.useState<string | null>(null);

React.useEffect(() => {
  supabase
    .from('restaurants')
    .select('*')
    .then(({ data, error }) => {
      if (error) setError(error.message);
      else setRestaurants(data ?? []);
      setLoading(false);
    });
}, []);
```

- Always handle `.error` from every Supabase call
- Always type the returned data (`Restaurant`, `Rating`, etc.)
- Define shared DB types in `src/lib/database.types.ts` (generate with `supabase gen types typescript`)

---

## Authentication

Supabase Auth is used. Helper hooks to be placed in `src/hooks/use-auth.ts`.

```ts
// src/hooks/use-auth.ts (to be created)
// Should expose: session, user, signIn, signOut, signUp, loading
```

- Protect routes using a layout guard in `src/app/(auth)/_layout.tsx`
- Never store the Supabase JWT manually — `supabase.auth` manages it

---

## Map Integration

⚠️ **Library not decided yet.** See root `CLAUDE.md` → Open Decisions.

When a library is chosen, add:
1. Install instructions here
2. A `src/components/restaurant-map.tsx` wrapper component
3. Update this section

**Interface the map component must expose:**
```tsx
type RestaurantMapProps = {
  restaurants: Pick<Restaurant, 'id' | 'name' | 'lat' | 'lng'>[];
  onMarkerPress: (id: string) => void;
  onMapLongPress?: (lat: number, lng: number) => void; // add new restaurant
};
```

---

## TypeScript Types

Keep shared types in `src/types/`:

```ts
// src/types/restaurant.ts
export type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  created_by: string;   // user_id (UUID)
  created_at: string;   // ISO timestamp
};

// src/types/rating.ts
export type Rating = {
  id: string;
  restaurant_id: string;
  user_id: string;
  score: 1 | 2 | 3 | 4 | 5;
  note: string | null;
  created_at: string;
};
```

---

## Hooks Naming

| File | Purpose |
|---|---|
| `use-color-scheme.ts` | OS color scheme (dark/light) |
| `use-theme.ts` | Themed color tokens |
| `use-auth.ts` | Supabase auth session |
| `use-restaurants.ts` | Fetch / mutate restaurants |
| `use-ratings.ts` | Fetch / mutate ratings |

---

## Platform-Specific Files

Expo resolves `.web.tsx` over `.tsx` on web, and `.native.tsx` on native.

```
component.tsx        ← shared (native default)
component.web.tsx    ← web override
```

Existing overrides: `app-tabs.web.tsx`, `animated-icon.web.tsx`, `use-color-scheme.web.ts`.

---

## What NOT to Do (Frontend)

- Do not use `StyleSheet.create` for new components — use NativeWind `className`
- Do not import from `react-navigation` directly — use `expo-router`
- Do not use `any` type — define proper types
- Do not put business logic inside screen files — extract to hooks
- Do not call Supabase directly from components — call from hooks
