# CLAUDE.md — SplitFlow

> Expense-splitting mobile app. This file is an **index**, not an encyclopedia.
> Skim it, then follow the pointers.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Expo (managed → prebuild) | SDK 54 |
| Router | expo-router (file-based) | 6.x |
| Language | TypeScript (strict) | 5.9 |
| UI | React Native + styled-components | RN 0.81 |
| State | Zustand | 5.x |
| Server State | TanStack React Query | 5.x |
| Forms | react-hook-form + Zod | RHF 7 / Zod 4 |
| Backend | Supabase (auth, DB, realtime) | 2.x |
| Animations | react-native-reanimated | 4.x |
| Charts | Victory Native + Skia | — |
| Font | Inter (via @expo-google-fonts) | — |

---

## Project Structure

```
src/
├── app/                 # Expo Router file-based routes
│   ├── (auth)/          # Auth screens (login, signup)
│   ├── (tabs)/          # Bottom tab navigator
│   │   ├── index.tsx    # Home / Balances
│   │   ├── groups.tsx   # Groups list
│   │   ├── activity.tsx # Activity feed
│   │   ├── analytics.tsx# Charts & insights
│   │   └── profile.tsx  # User settings
│   ├── expense/         # Add/edit expense flow
│   ├── group/           # Group detail / management
│   └── settle/          # Settlement flow
├── features/            # Domain modules (feature-sliced)
│   ├── auth/
│   ├── balances/        # Balance engine (core algorithm)
│   ├── expenses/
│   ├── friends/
│   ├── groups/
│   ├── settlements/
│   ├── activity/
│   └── analytics/
├── services/            # External integrations
│   ├── firebase/        # Push notifications (legacy)
│   └── supabase/        # Client init, auth helpers
└── shared/              # Cross-cutting concerns
    ├── components/      # Reusable UI primitives
    ├── constants/       # Theme, colors, spacing
    ├── hooks/           # useThemeStore, useCurrency, useUser…
    ├── types/           # Global TS types + styled.d.ts
    ├── utils/           # Pure helpers
    └── services/        # Shared service utilities
```

---

## Build & Run Commands

```bash
# Dev
yarn start              # Expo dev server
yarn ios                # Run on iOS simulator
yarn android            # Run on Android emulator

# Test
yarn test               # Jest (unit)
yarn test:watch         # Jest watch mode

# Build (EAS)
yarn prebuild           # Generate native dirs
eas build --profile development   # Dev client
eas build --profile preview       # Internal distro
eas build --profile production    # Store build
```

---

## Coding Conventions

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils/helpers: `camelCase.ts`
- Types: `index.ts` inside `types/` dirs

### Code Style (enforced)
- **Prettier**: 100 char width, single quotes, trailing commas, bracket same line
- **ESLint**: expo + prettier config; `no-inline-styles` is a warning
- Config files: `.prettierrc`, `.eslintrc.js`

### Patterns
- **Styling**: `styled-components` — no inline styles (linted)
- **State**: Zustand stores per feature; React Query for server cache
- **Forms**: react-hook-form + Zod schema validation
- **Imports**: Use `@/*` path alias → maps to `src/*`
- **Feature isolation**: Each feature owns its hooks, components, stores
- **Shared code**: Only goes in `src/shared/` if used by 2+ features

### TypeScript
- `strict: true` — no `any` unless explicitly justified
- Shared types live in `src/shared/types/index.ts`
- Styled-components theme is typed via `src/shared/types/styled.d.ts`

---

## Environment & Secrets

```bash
# Copy .env.example → .env, fill from Supabase Dashboard > Settings > API
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- All client env vars prefixed with `EXPO_PUBLIC_`
- Never commit `.env` (gitignored)
- See `.env.example` for field descriptions

---

## The 95% Confidence Rule

> **Do not generate or modify code unless you are ≥95% confident it is correct.**

What this means in practice:
1. **Read before you write.** Open the file. Check the imports, types, and neighboring code.
2. **If unsure, ask.** A question costs nothing; a broken build costs time.
3. **No hallucinated imports.** Verify the module exists in `package.json` or the codebase.
4. **No guessed APIs.** Check the actual function signature, not what you think it is.
5. **Test your assumptions.** If a change depends on behavior you haven't verified, say so.

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Expo managed + prebuild | Native modules via dev client, no bare ejection |
| File-based routing | Convention over config; mirrors web mental model |
| Zustand over Redux | Minimal boilerplate, no providers, TS-first |
| styled-components | Co-located styles, theme-aware, typed |
| Feature-sliced design | Each domain is self-contained; avoids cross-imports |
| Supabase over raw Postgres | Auth + DB + realtime in one SDK |

---

## Where to Find More

| Topic | Location |
|-------|----------|
| Supabase schema & migrations | `supabase/migrations/` |
| Theme tokens (colors, spacing) | `src/shared/constants/` |
| Global TypeScript types | `src/shared/types/index.ts` |
| Styled-components theme type | `src/shared/types/styled.d.ts` |
| Auth flow & Google OAuth | `src/features/auth/` + `src/services/firebase/` |
| Balance calculation engine | `src/features/balances/` |
| EAS build profiles | `eas.json` |
| Babel plugins (reanimated) | `babel.config.js` |
| Environment variables | `.env.example` |

---

*Last updated: 2026-04-27*
