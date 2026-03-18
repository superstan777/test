# Liquid Glass — expo-ui / SwiftUI Integration

> Status: **iOS only** (Android Jetpack Compose support coming soon from Expo team)
> Requires: Xcode 16+, Expo SDK 55+, bare/managed workflow with native build (not Expo Go)

---

## Overview

`expo-ui` exposes native SwiftUI components directly in React Native. On iOS this gives real
Liquid Glass rendering — the same engine as first-party Apple apps — at zero cost (no external
paid library). On Android / Web we fall back to standard React Native components.

The pattern is identical to the existing overrides already in this project:

```
component.tsx         ← Android + Web (standard RN)
component.ios.tsx     ← iOS (uses expo-ui SwiftUI)
```

---

## 1. Installation

```bash
npx expo install expo-ui
```

No extra config in `app.json` is needed for Expo managed workflow.

---

## 2. Core Concepts

### `<Host>`

Every SwiftUI subtree must be wrapped in `<Host>`. Think of it like an SVG root — it creates
a native container that renders the SwiftUI view hierarchy.

```tsx
import { Host } from "expo-ui/swiftui";

<Host>{/* SwiftUI components go here */}</Host>;
```

### Layout: `VStack` / `HStack`

Replace Flexbox with SwiftUI stacks inside a `<Host>`:

```tsx
import { Host, VStack, HStack } from "expo-ui/swiftui";

<Host>
  <VStack>
    <HStack>{/* children */}</HStack>
  </VStack>
</Host>;
```

### Modifiers

Visual appearance is controlled by passing a `modifiers` prop — an array of modifier functions:

```tsx
import { background, padding, cornerRadius } from 'expo-ui/swiftui/modifiers';

<VStack modifiers={[
  background({ color: 'systemBackground' }),
  padding({ all: 16 }),
  cornerRadius(12),
]}>
```

---

## 3. Liquid Glass Effects

### Glass Button (style prop)

```tsx
import { Host, Button } from "expo-ui/swiftui";

<Host>
  <Button
    title="Add Restaurant"
    style="glass" // or "glassProminent"
    onPress={() => {}}
  />
</Host>;
```

| `style` value      | Effect                   |
| ------------------ | ------------------------ |
| `"glass"`          | Subtle translucent glass |
| `"glassProminent"` | Stronger glass, accented |

### Glass Container / Card

```tsx
import { Host, VStack } from "expo-ui/swiftui";
import { background, padding, cornerRadius } from "expo-ui/swiftui/modifiers";

<Host>
  <VStack
    modifiers={[
      background({ material: "ultraThinMaterial" }), // the glass material
      padding({ all: 16 }),
      cornerRadius(16),
    ]}
  >
    {/* content */}
  </VStack>
</Host>;
```

**Available materials (glass tiers):**
| Material | Opacity |
|---|---|
| `ultraThinMaterial` | Very subtle |
| `thinMaterial` | Light |
| `regularMaterial` | Standard glass |
| `thickMaterial` | Heavier |
| `ultraThickMaterial` | Nearly opaque glass |

### Switch (auto glass)

```tsx
import { Host, Switch } from "expo-ui/swiftui";

<Host>
  <Switch value={isOn} onValueChange={(val) => setIsOn(val)} />
</Host>;
```

### Slider (auto glass)

```tsx
import { Host, Slider } from "expo-ui/swiftui";

<Host>
  <Slider
    value={rating}
    minimumValue={1}
    maximumValue={5}
    step={1}
    onValueChange={(val) => setRating(val)}
  />
</Host>;
```

### Context Menu (glass blur)

```tsx
import { Host, ContextMenu } from 'expo-ui/swiftui';

<Host>
  <ContextMenu
    menuItems={[
      { title: 'Edit', action: () => {} },
      { title: 'Delete', destructive: true, action: () => {} },
    ]}
  >
    {/* long-press target */}
    <RestaurantCard ... />
  </ContextMenu>
</Host>
```

---

## 4. Platform Override Pattern

This project already uses `.web.tsx` overrides. The same pattern applies for iOS:

```
src/components/glass-button.tsx         ← Android + Web fallback
src/components/glass-button.ios.tsx     ← iOS native (expo-ui)
```

### Android / Web fallback (`glass-button.tsx`)

```tsx
import React from "react";
import { Pressable, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
};

export function GlassButton({ title, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl bg-white/20 px-5 py-3 border border-white/30"
    >
      <Text className="text-white font-semibold text-base">{title}</Text>
    </Pressable>
  );
}
```

### iOS native (`glass-button.ios.tsx`)

```tsx
import { Host, Button } from "expo-ui/swiftui";
import React from "react";

type Props = {
  title: string;
  onPress: () => void;
};

export function GlassButton({ title, onPress }: Props) {
  return (
    <Host>
      <Button title={title} style="glass" onPress={onPress} />
    </Host>
  );
}
```

---

## 5. Components to Build for Restaumat

These components should be created as platform overrides when implementing the app:

| Component file                          | Where used                | Glass element                  |
| --------------------------------------- | ------------------------- | ------------------------------ |
| `components/glass-button.ios.tsx`       | Map FAB, forms            | `Button style="glass"`         |
| `components/restaurant-card.ios.tsx`    | Home list, Map callout    | `VStack` + `ultraThinMaterial` |
| `components/rating-stars.ios.tsx`       | Detail screen             | `HStack` + `Slider`            |
| `components/context-menu-card.ios.tsx`  | Long-press on restaurant  | `ContextMenu`                  |
| `components/glass-bottom-sheet.ios.tsx` | Add restaurant, Rate form | `VStack` + `regularMaterial`   |

For each of these: the matching `.tsx` file (no platform suffix) must also exist with a standard
NativeWind/RN fallback so Android and Web do not crash.

---

## 6. Map FAB Example (Add Restaurant Button)

This is the most visible glass element — a floating action button over the map.

### `src/components/map-fab.ios.tsx`

```tsx
import { Host, Button } from "expo-ui/swiftui";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export function MapFab() {
  const router = useRouter();
  return (
    <View className="absolute bottom-8 right-5">
      <Host>
        <Button
          title="+ Add"
          style="glassProminent"
          onPress={() => router.push("/restaurant/new")}
        />
      </Host>
    </View>
  );
}
```

### `src/components/map-fab.tsx`

```tsx
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

export function MapFab() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/restaurant/new")}
      className="absolute bottom-8 right-5 bg-blue-600 rounded-full px-5 py-3 shadow-lg"
    >
      <Text className="text-white font-bold text-base">+ Add</Text>
    </Pressable>
  );
}
```

---

## 7. Constraints & Notes

- Liquid Glass requires a **native build** — it does not render in Expo Go (use `expo-dev-client`)
- Build toolchain: **Xcode 16+** is required
- Do not put SwiftUI components outside a `<Host>` — it will throw a runtime error
- `<Host>` has a fixed size determined by its content — wrap in a `<View>` if you need explicit dimensions
- State sync: use `onValueChange` / `onPress` props to sync SwiftUI component state back to React state
- The `expo-ui` package is currently in **beta** — API surface may change between Expo SDK minor versions; pin the version and review release notes on upgrades

---

## 8. Useful Links

- [expo-ui docs](https://docs.expo.dev/versions/latest/sdk/ui/)
- [SwiftUI materials reference](https://developer.apple.com/documentation/swiftui/material)
- [expo-dev-client setup](https://docs.expo.dev/develop/development-builds/introduction/)
