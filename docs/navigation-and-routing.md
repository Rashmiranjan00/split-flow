# Navigation & Routing

> File-based routing via expo-router 6.x. 18 route files total.

---

## Route Map

```
src/app/
├── _layout.tsx              ← Root: AuthGate + providers + Stack
│
├── (auth)/
│   ├── _layout.tsx          ← Stack (headerShown: false)
│   └── index.tsx            ← Sign In / Sign Up (unified)
│
├── (tabs)/
│   ├── _layout.tsx          ← Bottom Tab Navigator (5 tabs)
│   ├── index.tsx            ← Home / Balances
│   ├── friends.tsx          ← Friends list
│   ├── groups.tsx           ← Groups list
│   ├── activity.tsx         ← Activity feed
│   └── profile.tsx          ← User settings
│
├── expense/
│   ├── add.tsx              ← Add expense (modal)
│   └── split.tsx            ← Split preview (demo)
│
├── friend/
│   └── [friendId].tsx       ← Friend detail (card)
│
├── friend-requests/
│   ├── search.tsx           ← Search users (modal)
│   └── requests.tsx         ← Manage requests (modal)
│
├── group/
│   ├── [groupId].tsx        ← Group detail (card)
│   ├── create.tsx           ← Create group (modal)
│   └── add-members.tsx      ← Add members (modal)
│
└── settle/
    └── [friendId].tsx       ← Settle up (modal)
```

---

## Layout Nesting Hierarchy

```
Root Layout (_layout.tsx)
├── SafeAreaProvider
├── QueryClientProvider (React Query)
├── ThemeProvider (styled-components)
└── AuthGate
    └── Stack Navigator
        ├── (auth) group
        │   └── Stack (headerless)
        │       └── index → Auth Screen
        │
        ├── (tabs) group
        │   └── Tab Navigator (5 tabs, headerless)
        │       ├── index → Home
        │       ├── friends → Friends
        │       ├── groups → Groups
        │       ├── activity → Activity
        │       └── profile → Profile
        │
        └── Modal/Card routes (at root Stack level)
            ├── group/[groupId]        (card)
            ├── group/create           (modal)
            ├── group/add-members      (modal)
            ├── friend/[friendId]      (card)
            ├── expense/add            (modal)
            ├── expense/split          (modal)
            ├── settle/[friendId]      (modal)
            ├── friend-requests/search (modal)
            └── friend-requests/requests (modal)
```

---

## Auth Guard (AuthGate)

The root layout wraps all routes in an `AuthGate` component:

```typescript
function AuthGate({ children }) {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // 1. Restore session on mount
  useEffect(() => { hydrate(); }, []);

  // 2. Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // 3. Show spinner while hydrating
  if (isLoading) return <LoadingSpinner />;

  return <Stack>...</Stack>;
}
```

**Rules:**

- Unauthenticated users are always redirected to `/(auth)`
- Authenticated users are always redirected away from `/(auth)` to `/(tabs)`
- No per-screen guards — the root gate handles everything
- Session hydration happens once on cold start

---

## Stack Screen Configuration

All modal/card routes are defined in the root Stack:

| Route                      | Presentation | Header |
| -------------------------- | ------------ | ------ |
| `(tabs)`                   | default      | hidden |
| `(auth)`                   | default      | hidden |
| `group/[groupId]`          | `card`       | hidden |
| `group/create`             | `modal`      | hidden |
| `group/add-members`        | `modal`      | hidden |
| `friend/[friendId]`        | `card`       | hidden |
| `expense/add`              | `modal`      | hidden |
| `expense/split`            | `modal`      | hidden |
| `settle/[friendId]`        | `modal`      | hidden |
| `friend-requests/search`   | `modal`      | hidden |
| `friend-requests/requests` | `modal`      | hidden |

**Presentation types:**

- `modal` — Slides up from bottom (iOS sheet-style); can be swiped down to dismiss
- `card` — Full-screen push with standard navigation animation

---

## Bottom Tab Navigator

Defined in `(tabs)/_layout.tsx` with 5 tabs:

| Tab      | Route      | Icon   | Label    |
| -------- | ---------- | ------ | -------- |
| Home     | `index`    | Home   | Home     |
| Friends  | `friends`  | Users  | Friends  |
| Groups   | `groups`   | Layers | Groups   |
| Activity | `activity` | Clock  | Activity |
| Profile  | `profile`  | User   | Profile  |

**Config:** `headerShown: false`, custom tab bar colors from theme.

---

## Dynamic Routes & Parameters

### Path Parameters

| Route               | Param              | Source                         |
| ------------------- | ------------------ | ------------------------------ |
| `friend/[friendId]` | `friendId: string` | From friends list tap          |
| `group/[groupId]`   | `groupId: string`  | From groups list tap           |
| `settle/[friendId]` | `friendId: string` | From friend detail "Settle up" |

### Query Parameters

| Route               | Params                    | Usage                                          |
| ------------------- | ------------------------- | ---------------------------------------------- |
| `settle/[friendId]` | `?groupId=...&amount=...` | Pre-fill settlement amount and group context   |
| `expense/add`       | `?groupId=...`            | Pre-select group when adding from group detail |
| `group/add-members` | `?groupId=...`            | Target group for adding members                |

---

## Navigation Patterns

### From Tab Screens

```
Home (tabs/index)
  ├── FAB (+) ────────→ /expense/add
  └── "See All" ──────→ /(tabs)/activity

Friends (tabs/friends)
  ├── Friend row ─────→ /friend/{friendId}
  ├── "+" button ─────→ /friend-requests/search
  └── Inbox icon ─────→ /friend-requests/requests

Groups (tabs/groups)
  ├── Group card ─────→ /group/{groupId}
  └── "+" button ─────→ /group/create

Profile (tabs/profile)
  └── Sign Out ───────→ /(auth)
```

### From Detail/Modal Screens

```
Friend Detail (/friend/[friendId])
  └── "Settle up" ───→ /settle/{friendId}?groupId=...&amount=...

Group Detail (/group/[groupId])
  ├── "+" members ───→ /group/add-members?groupId=...
  ├── "Settle up" ───→ /settle/{friendId}
  └── FAB ───────────→ /expense/add?groupId=...

Expense Add (/expense/add)
  └── Save ──────────→ router.back()

Settle (/settle/[friendId])
  └── "Mark Settled" → router.back()

Create Group (/group/create)
  └── Create ────────→ router.back()
```

---

## Screen Summary Table

| Screen            | Route                      | Purpose                                 | Key Data                                    |
| ----------------- | -------------------------- | --------------------------------------- | ------------------------------------------- |
| **Auth**          | `(auth)/index`             | Sign in/up with email+password          | Zod validation, toggle mode                 |
| **Home**          | `(tabs)/index`             | Balance overview + recent activity      | `useBalances()`, `useActivity()`            |
| **Friends**       | `(tabs)/friends`           | Friend list with balance per friend     | `useFriends()`, `useFriendBalances()`       |
| **Groups**        | `(tabs)/groups`            | Group cards with member count + balance | `useGroups()`, `useGroupBalances()`         |
| **Activity**      | `(tabs)/activity`          | Full activity feed grouped by date      | `useActivity()`                             |
| **Profile**       | `(tabs)/profile`           | Theme, currency, account settings       | `useThemeStore`, `useCurrencyStore`         |
| **Friend Detail** | `friend/[friendId]`        | Stats, transactions, insights charts    | `useFriendAnalytics()`                      |
| **Group Detail**  | `group/[groupId]`          | Expenses, balances, members, insights   | `useGroupBalances()`, `useGroupAnalytics()` |
| **Add Expense**   | `expense/add`              | Full expense form with split editor     | `useAddExpenseForm()`                       |
| **Split Preview** | `expense/split`            | Demo split breakdown (static)           | Hard-coded data                             |
| **Settle Up**     | `settle/[friendId]`        | Payment confirmation flow               | `useCreateSettlementMutation()`             |
| **Search Users**  | `friend-requests/search`   | Find users by email, send requests      | `useUserSearch()`                           |
| **Requests**      | `friend-requests/requests` | Accept/reject incoming, cancel sent     | `useFriendRequests()`                       |
| **Create Group**  | `group/create`             | Group name + description + members      | `useCreateGroupMutation()`                  |
| **Add Members**   | `group/add-members`        | Add friends to existing group           | `useAddGroupMemberMutation()`               |

---

## Related Documentation

- [Architecture Overview](./architecture-overview.md) — Project structure, tech stack
- [Features & Domain Logic](./features-and-domain-logic.md) — Hooks, stores, business logic
- [UI Component Library](./ui-component-library.md) — Shared components used in screens
