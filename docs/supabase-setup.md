# Supabase Backend Setup

This document explains how to configure the Supabase backend for SplitFlow.

## Prerequisites

- A [Supabase](https://supabase.com) account
- Node.js 20+ and the Expo CLI
- The SplitFlow repo cloned locally

## 1. Create a Supabase project

1. Go to [database.new](https://database.new) and create a new project.
2. Note the **Project URL** and **Publishable key** from **Dashboard > Settings > API > API Keys**.

> **Key naming:** We use the new `sb_publishable_xxx` format (Publishable key), not the
> legacy `anon` key. If you're following older Supabase docs that reference `ANON_KEY`,
> the publishable key replaces it going forward.

## 2. Run the database migration

Open the Supabase SQL Editor and paste the full contents of:

```
supabase/migrations/0001_init.sql
```

This creates all tables (`profiles`, `groups`, `group_members`, `expenses`,
`expense_participants`, `expense_splits`, `settlements`, `friendships`), the
`handle_new_user` trigger for auto-profile creation, the `is_group_member` helper,
the `create_expense` RPC, indexes, and all RLS policies.

## 3. Local environment setup

1. Copy the template:

   ```bash
   cp .env.example .env
   ```

2. Fill in the real values in `.env`:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
   ```

3. `.env` is gitignored and must never be committed. `.env.example` stays in the repo
   as the onboarding template.

## 4. EAS Build secrets (production)

Set project-scoped secrets so EAS builds receive the variables automatically:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co" --type string
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_xxx" --type string
```

These are injected as environment variables during `eas build`. No `eas.json` `env`
block is needed unless you use separate Supabase projects per build profile.

## 5. Rotating keys

To rotate a key:

```bash
eas secret:delete --scope project --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_NEW_VALUE" --type string
```

Update your local `.env` with the new value as well.

## 6. Regenerating database types

If you change the schema, regenerate the TypeScript types:

```bash
npx supabase gen types typescript --project-id <your-project-id> > src/services/supabase/database.types.ts
```

## Architecture summary

```
Screens --> React Query hooks --> Service modules (src/services/supabase/*.ts)
                                    ├── mappers.ts  (snake_case ↔ camelCase, cents ↔ dollars)
                                    └── supabase.ts (client singleton, localStorage session)
                                           ↓
                                    Supabase (Postgres + Auth)
```

- **Auth**: Supabase Email+Password. Session persisted via `expo-sqlite` localStorage polyfill.
- **Data stores**: Zustand is used only for auth session cache + UI preferences (theme, currency).
  All domain data (groups, expenses, settlements, friends) flows through TanStack React Query.
- **Balance engine**: Runs client-side in `src/shared/utils/balanceEngine.ts`, fed by
  whatever arrays React Query returns. Not moved to the server.
- **Money**: Stored as integer minor units (cents/paisa) in Postgres. Converted to float
  dollars at the service-layer boundary via `fromCents`/`toCents` in `src/shared/utils/money.ts`.
