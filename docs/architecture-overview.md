# Architecture Overview

> SplitFlow — Expense-splitting mobile app built with Expo + React Native.

---

## Tech Stack

| Layer          | Technology                          | Version          |
| -------------- | ----------------------------------- | ---------------- |
| Framework      | Expo (managed → prebuild)           | SDK 54           |
| Router         | expo-router (file-based)            | 6.x              |
| Language       | TypeScript (strict)                 | 5.9              |
| UI             | React Native + styled-components    | RN 0.81 / SC 6.x |
| State (client) | Zustand                             | 5.x              |
| State (server) | TanStack React Query                | 5.x              |
| Forms          | react-hook-form + Zod               | RHF 7 / Zod 4    |
| Backend        | Supabase (Auth, Postgres, Realtime) | 2.x              |
| Animations     | react-native-reanimated             | 4.x              |
| Charts         | Victory Native + Skia               | 41.x / 2.2       |
| Icons          | lucide-react-native                 | —                |
| Font           | Inter (via @expo-google-fonts)      | —                |
| Date           | dayjs                               | 1.11             |

---

## Project Structure

```
src/
├── app/                     # Expo Router file-based routes
│   ├── _layout.tsx          # Root layout (AuthGate, providers, stack)
│   ├── (auth)/              # Auth screens (login/signup)
│   ├── (tabs)/              # Bottom tab navigator (5 tabs)
│   ├── expense/             # Add expense modal flow
│   ├── friend/              # Friend detail card
│   ├── friend-requests/     # Search & manage requests
│   ├── group/               # Group detail + create + add members
│   └── settle/              # Settlement flow
│
├── features/                # Domain modules (feature-sliced)
│   ├── auth/                # Auth store (Zustand)
│   ├── balances/            # Balance engine hooks
│   ├── expenses/            # Expense form, split editors, mutations
│   ├── friends/             # Friend list, requests, search
│   ├── groups/              # Group CRUD, member management
│   ├── settlements/         # Settlement mutation
│   ├── activity/            # Unified activity feed
│   └── analytics/           # Charts, insights, category config
│
├── services/                # External integrations
│   └── supabase/            # Client init, auth, API functions, mappers
│
└── shared/                  # Cross-cutting concerns
    ├── components/          # Reusable UI primitives (7 components)
    ├── constants/           # Theme, colors, spacing, typography
    ├── hooks/               # useThemeStore, useCurrency, useUser, etc.
    ├── types/               # Global TS types + styled.d.ts
    ├── utils/               # Balance engine, split algorithm, money
    └── services/            # AsyncStorage adapter for Zustand
```

---

## Feature-Sliced Design

The app follows **feature-sliced architecture** — each domain module is self-contained:

```
features/{feature}/
├── hooks/           # React Query hooks, custom logic
├── components/      # Feature-specific UI
├── store/           # Zustand store (if needed)
└── utils/           # Feature-specific helpers
```

**Rules:**

- Features never import from other features directly
- Shared code lives in `src/shared/` only if used by 2+ features
- Server communication flows exclusively through React Query hooks
- Each feature owns its cache keys, mutations, and invalidation logic

---

## Module Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│                   src/app/ (Routes)                  │
│  Imports from: features/, shared/                    │
└───────────────────────┬─────────────────────────────┘
                        │ uses
┌───────────────────────▼─────────────────────────────┐
│              src/features/ (Domain Logic)            │
│  Each feature imports from: shared/, services/      │
└───────────────────────┬─────────────────────────────┘
                        │ calls
┌───────────────────────▼─────────────────────────────┐
│            src/services/supabase/ (API Layer)        │
│  Imports from: shared/types, shared/utils           │
└───────────────────────┬─────────────────────────────┘
                        │ queries
┌───────────────────────▼─────────────────────────────┐
│              Supabase (PostgreSQL + Auth)            │
└─────────────────────────────────────────────────────┘

Cross-cutting (imported by all layers):
┌─────────────────────────────────────────────────────┐
│                   src/shared/                        │
│  components, constants, hooks, types, utils         │
└─────────────────────────────────────────────────────┘
```

---

## Key Architecture Decisions

| Decision                             | Rationale                                                        |
| ------------------------------------ | ---------------------------------------------------------------- |
| Expo managed + prebuild              | Native modules via dev client, no bare ejection needed           |
| File-based routing (expo-router)     | Convention over config; mirrors web mental model                 |
| Zustand over Redux                   | Minimal boilerplate, no providers needed, TypeScript-first       |
| styled-components over inline styles | Co-located styles, theme-aware, fully typed, linted              |
| Feature-sliced design                | Self-contained domains; prevents spaghetti cross-imports         |
| Supabase over raw Postgres           | Auth + DB + Realtime in one SDK; RLS for security                |
| Cents internally                     | Integer arithmetic avoids floating-point drift in money          |
| React Query for server state         | Automatic caching, background refetch, optimistic updates        |
| Zod + react-hook-form                | Schema-first validation; type-safe forms with minimal re-renders |

---

## Configuration Files

| File              | Purpose                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `app.json`        | Expo app config — bundle IDs, permissions, plugins, EAS project    |
| `eas.json`        | EAS Build profiles (development, preview, production)              |
| `tsconfig.json`   | TypeScript strict mode, `@/*` path alias → `src/*`                 |
| `babel.config.js` | babel-preset-expo + reanimated plugin                              |
| `jest.config.js`  | React Native preset, babel-jest transform, path mapping            |
| `.prettierrc`     | 100 char width, single quotes, trailing commas, bracketSameLine    |
| `.eslintrc.js`    | Expo + Prettier config; `no-inline-styles` warning                 |
| `.env.example`    | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

### TypeScript Configuration

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "skipLibCheck": true,
  },
}
```

### EAS Build Profiles

| Profile       | Channel | Distribution | Use Case                       |
| ------------- | ------- | ------------ | ------------------------------ |
| `development` | —       | internal     | Dev client with native modules |
| `preview`     | —       | internal     | Internal testing builds        |
| `production`  | —       | store        | App Store / Play Store         |

---

## Build & Run Commands

```bash
# Development
yarn start              # Expo dev server
yarn ios                # Run on iOS simulator
yarn android            # Run on Android emulator

# Testing
yarn test               # Jest (unit tests)
yarn test:watch         # Jest watch mode

# Native Build
yarn prebuild           # Generate native dirs (ios/, android/)

# EAS Cloud Builds
eas build --profile development   # Dev client
eas build --profile preview       # Internal distribution
eas build --profile production    # Store submission

# Local EAS Build
yarn build:ios:local    # Local iOS build
yarn build:android      # Android preview build
```

---

## Environment & Secrets

All client environment variables are prefixed with `EXPO_PUBLIC_`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

- `.env` is gitignored — never committed
- Copy `.env.example` → `.env` and fill from Supabase Dashboard
- Only the **anon/publishable** key is used client-side (Row-Level Security enforces access)

---

## App Identity

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| App Name        | SplitFlow                              |
| iOS Bundle ID   | `com.fraeloth.splitflow`               |
| Android Package | `com.fraeloth.splitflow`               |
| EAS Project ID  | `cb392d7f-0a71-46c1-a3ee-7294668a6bd0` |
| Version         | 1.0.0                                  |

---

## Related Documentation

- [Database Schema](./database-schema.md) — Tables, RLS, RPCs
- [Navigation & Routing](./navigation-and-routing.md) — Route map, guards, screen details
- [Features & Domain Logic](./features-and-domain-logic.md) — Business logic deep-dive
- [UI Component Library](./ui-component-library.md) — Shared components, theme, typography
- [Data Flow & State Management](./data-flow-and-state-management.md) — Supabase, React Query, Zustand
