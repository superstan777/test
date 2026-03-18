# Setup Guide — Supabase + NativeWind

> Step-by-step instructions to wire up the two main infrastructure pieces.
> Run these steps once when bootstrapping the project.

---

## 1. Supabase Setup

### 1.1 Create project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a strong database password and save it in a password manager
3. Select the free tier (no credit card required)
4. Region: choose closest to target users (e.g. `eu-central-1` for Poland)

### 1.2 Run database schema
Go to **SQL Editor** in Supabase dashboard and run the full SQL from `docs/database-schema.md` in order:
1. Create tables
2. Enable RLS
3. Create policies
4. Create indexes
5. (Optional) create views

### 1.3 Configure environment variables
Create `.env.local` in the project root (gitignored):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Find these in Supabase dashboard → **Project Settings → API**.

### 1.4 Install Supabase client
```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store
```

### 1.5 Create the Supabase client singleton
Create `src/lib/supabase.ts`:
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 1.6 Generate TypeScript types (optional but recommended)
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/database.types.ts
```

---

## 2. NativeWind v4 Setup

### 2.1 Install
```bash
npm install nativewind
npm install --save-dev tailwindcss@^3
```

### 2.2 Configure Tailwind
Create `tailwind.config.js` in project root:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 2.3 Update `src/global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.4 Configure Metro (babel)
Add to `babel.config.js` (create if missing):
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: ['nativewind/babel'],
  };
};
```

### 2.5 Update `app.json` — add CSS support
```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "nativewind/metro",
      ...
    ]
  }
}
```

Actually for NativeWind + Metro, update `metro.config.js` (create if missing):
```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './src/global.css' });
```

### 2.6 Import global CSS in root layout
Ensure `src/app/_layout.tsx` imports the CSS:
```tsx
import '@/global.css';
```

### 2.7 Verify
```tsx
<View className="flex-1 items-center justify-center bg-blue-500">
  <Text className="text-white text-xl font-bold">NativeWind works!</Text>
</View>
```

---

## 3. Auth Setup

### 3.1 Enable email auth
Supabase dashboard → **Authentication → Providers → Email** → Enable.

For development, disable "Confirm email" to skip the confirmation flow.

### 3.2 Create auth hook
Create `src/hooks/use-auth.ts`:
```ts
import React from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { session, user: session?.user ?? null, loading, signIn, signUp, signOut };
}
```

---

## 4. Environment / .gitignore

Ensure `.gitignore` contains:
```
.env.local
.env*.local
```

Never commit `EXPO_PUBLIC_SUPABASE_ANON_KEY` or any secret.
