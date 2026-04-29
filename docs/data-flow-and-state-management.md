# Data Flow & State Management

> How data moves through the app: Supabase → API Layer → React Query → UI.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  (React components in src/app/ and src/features/)           │
└───────────────────────────────┬─────────────────────────────┘
                                │ uses hooks
┌───────────────────────────────▼─────────────────────────────┐
│                   React Query Hooks                          │
│  (src/features/*/hooks/ — useBalances, useFriends, etc.)    │
│  Caching, background refetch, optimistic updates            │
└───────────────────────────────┬─────────────────────────────┘
                                │ calls
┌───────────────────────────────▼─────────────────────────────┐
│                   Supabase API Layer                         │
│  (src/services/supabase/ — auth.ts, expenses.ts, etc.)      │
│  Raw queries, RPC calls, error handling                     │
└───────────────────────────────┬─────────────────────────────┘
                                │ maps via
┌───────────────────────────────▼─────────────────────────────┐
│                      Mappers                                 │
│  (src/services/supabase/mappers.ts)                         │
│  snake_case → camelCase, cents → dollars                    │
└───────────────────────────────┬─────────────────────────────┘
                                │ network
┌───────────────────────────────▼─────────────────────────────┐
│                 Supabase (PostgreSQL + Auth)                 │
│  RLS policies + Security Definer RPCs                       │
└─────────────────────────────────────────────────────────────┘

  Side channel (client-only state):
┌─────────────────────────────────────────────────────────────┐
│                   Zustand Stores                             │
│  useAuthStore, useThemeStore, useCurrencyStore              │
│  Persisted to AsyncStorage                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Supabase Client Setup (`src/services/supabase/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Not a web app
    },
  }
);
```

**Key behaviors:**

- Session persisted to AsyncStorage (survives app restarts)
- Auto-refresh: tokens refreshed before expiry
- App state listener: refreshes session when app comes to foreground

---

## API Layer (`src/services/supabase/`)

### File Structure

| File                | Responsibility                                       |
| ------------------- | ---------------------------------------------------- |
| `supabase.ts`       | Client initialization, storage config                |
| `auth.ts`           | signUp, signIn, signOut, getSession, getProfile      |
| `expenses.ts`       | listExpensesByGroup, getExpense, createExpense (RPC) |
| `friends.ts`        | listFriends, searchUsers, send/accept/reject/remove  |
| `groups.ts`         | listMyGroups, getGroup, createGroup (RPC), addMember |
| `settlements.ts`    | listSettlementsByGroup, createSettlement             |
| `mappers.ts`        | 12 converter functions (DB ↔ app types)              |
| `queryKeys.ts`      | React Query key factory                              |
| `database.types.ts` | Auto-generated TypeScript interfaces                 |

### Pattern: Every API Function

```typescript
// Example: listFriends
export async function listFriends(): Promise<User[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('friend_id, profiles!friend_id(id, name, email, avatar_url)')
    .eq('owner_id', (await supabase.auth.getUser()).data.user!.id);

  if (error) throw error;
  return data.map(mapFriendRow); // snake_case → camelCase
}
```

**Conventions:**

- Every function throws on error (React Query catches it)
- Mappers convert at the boundary (DB rows → app types)
- RPC calls used for multi-table mutations (atomic)

---

## Mapper Layer (`src/services/supabase/mappers.ts`)

12 converter functions handling two transformations:

### 1. Case Conversion (snake_case → camelCase)

```typescript
// DB row → App type
mapExpenseRow(row) → Expense
mapGroupRow(row) → Group
mapSettlementRow(row) → Settlement
mapProfileRow(row) → User
mapFriendRequestRow(row) → FriendRequest
```

### 2. Money Conversion (cents → dollars)

```typescript
// At read boundary:
amount: fromCents(row.amount_minor); // 4250 → 42.50
owedAmount: fromCents(row.owed_minor); // 1500 → 15.00

// At write boundary:
amount_minor: toCents(input.amount); // 42.50 → 4250
owed_minor: toCents(input.owedAmount); // 15.00 → 1500
```

**Rule:** Cents never leak into the UI layer. The app always works with dollar floats after mapping.

---

## React Query Configuration

### Query Client (Root Layout)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
```

### Query Key Factory (`src/services/supabase/queryKeys.ts`)

```typescript
export const queryKeys = {
  groups: ['groups'] as const,
  group: (id: string) => ['group', id] as const,
  expenses: (groupId: string) => ['expenses', groupId] as const,
  allExpenses: ['all-expenses'] as const,
  settlements: (groupId: string) => ['settlements', groupId] as const,
  allSettlements: ['all-settlements'] as const,
  friends: ['friends'] as const,
  friendRequests: ['friend-requests'] as const,
};
```

### Caching Strategy

| Data                  | Key                        | Stale Time | Shared By                               |
| --------------------- | -------------------------- | ---------- | --------------------------------------- |
| Groups list           | `['groups']`               | 5 min      | Groups tab, Home, Balance engine        |
| Single group          | `['group', id]`            | 5 min      | Group detail, Add members               |
| Expenses per group    | `['expenses', groupId]`    | 5 min      | Group detail, Balance engine, Analytics |
| All expenses          | `['all-expenses']`         | 5 min      | Balance aggregation, Activity feed      |
| Settlements per group | `['settlements', groupId]` | 5 min      | Group detail, Balance engine            |
| All settlements       | `['all-settlements']`      | 5 min      | Balance aggregation, Activity feed      |
| Friends               | `['friends']`              | 5 min      | Friends tab, Friend selector            |
| Friend requests       | `['friend-requests']`      | 5 min      | Requests screen, Search results         |

### Cache Invalidation on Mutations

```typescript
// After creating an expense:
queryClient.invalidateQueries({ queryKey: queryKeys.expenses(groupId) });
queryClient.invalidateQueries({ queryKey: queryKeys.allExpenses });
queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
queryClient.invalidateQueries({ queryKey: queryKeys.groups });

// After creating a settlement:
queryClient.invalidateQueries({ queryKey: queryKeys.settlements(groupId) });
queryClient.invalidateQueries({ queryKey: queryKeys.allSettlements });
queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
queryClient.invalidateQueries({ queryKey: queryKeys.groups });

// After friend actions:
queryClient.invalidateQueries({ queryKey: queryKeys.friends });
queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests });
```

---

## Zustand Stores

### Store Architecture

| Store              | Scope  | Persistence  | Purpose                      |
| ------------------ | ------ | ------------ | ---------------------------- |
| `useAuthStore`     | Global | AsyncStorage | Auth session, user profile   |
| `useThemeStore`    | Global | AsyncStorage | Light/dark/system preference |
| `useCurrencyStore` | Global | AsyncStorage | INR/USD selection            |

### Why Zustand (Not Redux/Context)?

- **No providers** — stores accessed via hooks anywhere
- **Minimal boilerplate** — no actions, reducers, selectors
- **TypeScript-first** — fully typed without extra generics
- **Persist middleware** — built-in AsyncStorage integration
- **Selective re-renders** — components only re-render on subscribed slices

### Storage Adapter

```typescript
// src/shared/services/storage.ts
export const zustandStorage: StateStorage = {
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  getItem: async (name) => (await AsyncStorage.getItem(name)) ?? null,
  removeItem: (name) => AsyncStorage.removeItem(name),
};
```

---

## Data Flow Diagrams

### Authentication Flow

```
App Launch
    │
    ▼
AuthGate.hydrate()
    │
    ▼
supabase.auth.getSession()
    │
    ├── Session exists → useAuthStore.login(user, session)
    │                         │
    │                         ▼
    │                    Redirect → /(tabs)
    │
    └── No session → Redirect → /(auth)
                         │
                         ▼
                    User enters email/password
                         │
                         ▼
                    supabase.auth.signInWithPassword()
                    or supabase.auth.signUp()
                         │
                         ▼
                    onAuthStateChange fires
                         │
                         ▼
                    Fetch profile from DB
                         │
                         ▼
                    useAuthStore.login(user, session)
                         │
                         ▼
                    AuthGate redirects → /(tabs)
```

### Expense Creation Flow

```
User fills form (expense/add.tsx)
    │
    ▼
useAddExpenseForm.handleSubmit()
    │
    ▼
Zod validates form data
    │
    ▼
calculateSplits() → compute per-person amounts
    │
    ▼
toCents(amount) → convert dollars to cents
    │
    ▼
createExpense() → supabase.rpc('create_expense', {...})
    │
    ▼
Supabase RPC atomically:
  1. INSERT expense
  2. INSERT expense_participants
  3. INSERT expense_splits
    │
    ▼
Mutation success → invalidateQueries([expenses, groups, all-expenses])
    │
    ▼
React Query refetches → balance engine recalculates
    │
    ▼
UI updates across all screens automatically
    │
    ▼
router.back() → return to previous screen
```

### Settlement Flow

```
User taps "Settle up" on friend/group detail
    │
    ▼
Navigate to /settle/{friendId}?groupId=...&amount=...
    │
    ▼
Display owed amount + payment method pills
    │
    ▼
User taps "Mark as Settled"
    │
    ▼
useCreateSettlementMutation.mutate({
  groupId, fromUser, toUser, amount
})
    │
    ▼
createSettlement() → supabase.from('settlements').insert(...)
    │
    ▼
toCents(amount) at write boundary
    │
    ▼
Mutation success → invalidateQueries([settlements, expenses, groups])
    │
    ▼
Balance engine recalculates (settlement cancels debt)
    │
    ▼
router.back()
```

### Friend Request Lifecycle

```
                    ┌─────────────────────┐
                    │  User A searches    │
                    │  for User B email   │
                    └──────────┬──────────┘
                               │
                               ▼
                    useUserSearch() → debounce 300ms
                               │
                               ▼
                    searchUsersByEmail() → supabase query
                               │
                               ▼
                    Show result with state:
                    • 'add' → Send Request button
                    • 'pending-out' → "Pending" (grayed)
                    • 'pending-in' → "Accept" button
                               │
                               ▼
                    ┌───────────────────────┐
                    │ A taps "Send Request" │
                    └───────────┬───────────┘
                                │
                                ▼
                    supabase.rpc('send_friend_request')
                                │
                                ▼
                    friend_requests: {
                      from: A, to: B, status: 'pending'
                    }
                                │
                                ▼
                    ┌───────────────────────┐
                    │  B sees incoming on   │
                    │  /friend-requests     │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            B taps "Accept"         B taps "Reject"
                    │                       │
                    ▼                       ▼
            supabase.rpc(           supabase.rpc(
              'accept_friend_         'reject_friend_
              request')               request')
                    │                       │
                    ▼                       ▼
            Creates bidirectional    Updates status
            friendships:             to 'rejected'
            A→B and B→A
                    │
                    ▼
            Both users see each
            other in Friends tab
```

### Balance Calculation Flow

```
useBalances() hook called (Home, Profile)
    │
    ▼
Fetch: all user's groups
    │
    ▼
For each group:
    ├── Fetch expenses (from cache or network)
    └── Fetch settlements (from cache or network)
    │
    ▼
Per group: calculateGroupBalances(expenses, settlements)
    │
    ├── buildLedger() → raw debt entries
    ├── aggregateBalances() → merge same pairs
    ├── netBalances() → cancel mutual debts
    ├── calculateNetPositions() → per-user sums
    └── simplifyDebts() → minimal transactions
    │
    ▼
Aggregate across all groups:
    ├── totalOwedToYou: sum of positive positions
    ├── totalYouOwe: sum of negative positions
    └── netBalance: totalOwedToYou - totalYouOwe
    │
    ▼
UI renders BalanceCard, friend balances, group balances
```

---

## Money Handling

### The Golden Rule

> **Cents (integers) internally. Dollars (floats) at boundaries only.**

### Boundary Points

| Direction          | Where                                   | Conversion                    |
| ------------------ | --------------------------------------- | ----------------------------- |
| Read (DB → App)    | `mappers.ts`                            | `fromCents(row.amount_minor)` |
| Write (App → DB)   | `createExpense()`, `createSettlement()` | `toCents(input.amount)`       |
| Display (App → UI) | `useCurrencyFormatter()`                | `Intl.NumberFormat`           |

### Why Cents?

```javascript
// Floating-point problem:
0.1 + 0.2 === 0.30000000000000004; // true (BAD)

// Integer solution:
10 + 20 === 30; // true (GOOD) — amounts in cents
```

### Precision in Splits

The split algorithm handles rounding drift:

1. Calculate each person's share
2. Round to 2 decimal places
3. Sum all rounded shares
4. If sum ≠ total, adjust first participant by the drift amount

---

## Error Handling Pattern

```typescript
// API layer: throw on error
export async function listFriends() {
  const { data, error } = await supabase.from(...).select(...);
  if (error) throw error;  // React Query catches this
  return data.map(mapRow);
}

// Hook layer: React Query provides error state
const { data, error, isLoading } = useQuery({
  queryKey: queryKeys.friends,
  queryFn: listFriends,
});

// UI layer: render based on state
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage />;
return <FriendList data={data} />;
```

---

## Related Documentation

- [Database Schema](./database-schema.md) — Tables, RLS, RPCs
- [Features & Domain Logic](./features-and-domain-logic.md) — Hooks that consume this data
- [Architecture Overview](./architecture-overview.md) — Overall system design
