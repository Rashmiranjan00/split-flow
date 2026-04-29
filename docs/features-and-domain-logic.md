# Features & Domain Logic

> 8 feature modules following feature-sliced architecture. Each module owns its hooks, components, stores, and utils.

---

## Overview

| Feature       | Purpose                      | Key Exports                                              |
| ------------- | ---------------------------- | -------------------------------------------------------- |
| `auth`        | Authentication state         | `useAuthStore` (Zustand)                                 |
| `balances`    | Balance calculation engine   | `useBalances()`, `useGroupBalances()`                    |
| `expenses`    | Expense creation & splitting | `useAddExpenseForm()`, split editors                     |
| `friends`     | Friend management & search   | `useFriends()`, `useFriendRequests()`, `useUserSearch()` |
| `groups`      | Group CRUD & membership      | `useGroups()`, `useGroupMembers()`                       |
| `settlements` | Payment recording            | `useCreateSettlementMutation()`                          |
| `activity`    | Unified activity feed        | `useActivity()`                                          |
| `analytics`   | Charts & insights            | `useGroupAnalytics()`, `useFriendAnalytics()`            |

---

## 1. Auth (`src/features/auth/`)

### Store: `useAuthStore` (Zustand + AsyncStorage persistence)

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login(user: User, session: Session): void;
  logout(): void;
  setLoading(loading: boolean): void;
  hydrate(): Promise<void>;
}
```

**Behavior:**

- Persisted to device storage via `zustandStorage` (AsyncStorage wrapper)
- `hydrate()` — Called on app mount; restores session via `supabase.auth.getSession()`
- Listens to `supabase.auth.onAuthStateChange()` for real-time session updates
- On login: resolves user profile from `profiles` table
- On logout: clears state + calls `supabase.auth.signOut()`

**Zod Schemas (Auth Form):**

```typescript
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(1).max(100),
});
```

---

## 2. Balances (`src/features/balances/`)

The core financial engine. Computes who owes whom across all groups.

### Balance Engine Pipeline (6 Steps)

```
Expenses + Settlements
        │
        ▼
┌─ 1. buildLedger() ──────────────┐
│  Convert splits → debt entries   │
│  Settlements → negative entries  │
└──────────────────────────────────┘
        │ Balance[]
        ▼
┌─ 2. aggregateBalances() ────────┐
│  Merge same-pair debts          │
│  (A→B $50) + (A→B $30) = $80   │
└──────────────────────────────────┘
        │ Balance[]
        ▼
┌─ 3. netBalances() ──────────────┐
│  Cancel mutual debts            │
│  (A→B $100) - (B→A $60) = $40  │
└──────────────────────────────────┘
        │ Balance[]
        ▼
┌─ 4. calculateNetPositions() ────┐
│  Sum per user across all debts  │
│  Positive = creditor            │
│  Negative = debtor              │
└──────────────────────────────────┘
        │ Record<UserId, number>
        ▼
┌─ 5. simplifyDebts() ───────────┐
│  Greedy match: largest debtor   │
│  → largest creditor             │
│  Minimizes total transactions   │
└──────────────────────────────────┘
        │ Balance[]
        ▼
┌─ 6. fromCents() ───────────────┐
│  Convert integer cents → floats │
│  For display only               │
└──────────────────────────────────┘
```

**All internal calculations use integer cents to avoid floating-point errors.**

### Hooks

#### `useBalances()`

Cross-group balance aggregation for the current user.

```typescript
interface BalancesResult {
  totalOwedToYou: number;
  totalYouOwe: number;
  netBalance: number;
  simplifiedDebts: Balance[];
  isEmpty: boolean;
  isLoading: boolean;
}
```

- Fetches all groups, expenses, and settlements for current user
- Runs `calculateGroupBalances()` per group, aggregates results
- Powers: Home screen balance card, profile net balance

#### `useGroupBalances(groupId)`

Per-group balance calculation.

```typescript
interface GroupBalancesResult {
  balances: Balance[];
  simplifiedDebts: Balance[];
  netPositions: Record<UserId, number>;
  isLoading: boolean;
}
```

- Query keys shared with `useGroupAnalytics()` for free caching
- Powers: Group detail balance tab, settle-up amounts

---

## 3. Expenses (`src/features/expenses/`)

### Form Hook: `useAddExpenseForm(groupId)`

```typescript
interface AddExpenseFormReturn {
  form: UseFormReturn<AddExpenseFormValues>;
  handleSubmit: (data: AddExpenseFormValues) => Promise<void>;
  participants: string[];
  splitType: SplitType;
  splitDetails: SplitDetail[];
  setSplitType(type: SplitType): void;
  updateSplitValues(details: SplitDetail[]): void;
  isSubmitting: boolean;
}
```

### Zod Schema (Expense Form)

```typescript
const addExpenseSchema = z.object({
  title: z.string().min(1).max(100),
  amount: z.string().refine((v) => parseFloat(v) > 0),
  paidBy: z.string().min(1),
  groupId: z.string(),
  participants: z.array(z.string()).min(1),
  splitType: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES']),
  splitDetails: z.array(
    z.object({
      userId: z.string(),
      owedAmount: z.number(),
    })
  ),
  category: z.string().optional(),
  notes: z.string().optional(),
  receiptUri: z.string().optional(),
});
```

### Split Algorithm (`src/shared/utils/splitAlgorithm.ts`)

```typescript
type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

calculateSplits(expense: ExpenseData): Record<string, number>
```

| Mode           | Logic                                 | Validation                                        |
| -------------- | ------------------------------------- | ------------------------------------------------- |
| **EQUAL**      | `total / participantCount` per person | Auto-corrects rounding drift on first participant |
| **EXACT**      | Use provided amounts directly         | Sum must equal total                              |
| **PERCENTAGE** | Apply % to total per person           | Sum of percentages must equal 100%                |
| **SHARES**     | Proportional split by share count     | At least 1 share per participant                  |

**Precision handling:** All modes use 2-decimal rounding with first-participant correction to prevent drift.

### Split Editor Components

| Component               | Mode       | UI                                      |
| ----------------------- | ---------- | --------------------------------------- |
| `EqualSplitEditor`      | EQUAL      | Toggle switches per member, auto-splits |
| `ExactSplitEditor`      | EXACT      | Text input per person, shows remaining  |
| `PercentageSplitEditor` | PERCENTAGE | % input, shows calculated amount        |
| `SharesSplitEditor`     | SHARES     | Share count input, reactive totals      |

### Mutation: `useCreateExpenseMutation()`

- Calls `createExpense()` → Supabase RPC
- **Invalidates:** expenses, settlements, group, groups, all-expenses query keys

### Additional Components

| Component             | Purpose                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| `ParticipantSelector` | Horizontal scrollable member picker with checkmarks                            |
| `PaidBySelector`      | Radio-style list for selecting payer                                           |
| `CategorySelector`    | 6 icon+label buttons (Food, Travel, Shopping, Utilities, Entertainment, Other) |
| `SplitPreviewCard`    | Shows "X owes Y $amount" debt preview                                          |
| `ReceiptUploader`     | Image picker with preview and remove                                           |
| `ExpenseCard`         | Transaction row with receipt icon, title, amount, date                         |

---

## 4. Friends (`src/features/friends/`)

### Hooks

#### `useFriends()`

```typescript
interface FriendsResult {
  friends: User[];
  isEmpty: boolean;
  totalFriends: number;
  isLoading: boolean;
  error: Error | null;
}
```

- Uses `placeholderData: []` for instant render (no loading spinner)

#### `useFriendBalances()`

```typescript
interface FriendBalancesResult {
  getBalance(friendId: string): FriendBalance;
  isLoading: boolean;
  totalNet: number;
}

interface FriendBalance {
  net: number; // > 0 = friend owes you, < 0 = you owe friend
  tone: 'positive' | 'negative' | 'settled';
}
```

- Derives from `useBalances().simplifiedDebts`
- Folds debts by friend ID across all shared groups

#### `useFriendRequests()`

```typescript
interface FriendRequestsResult {
  incoming: FriendRequestWithProfile[];
  outgoing: FriendRequestWithProfile[];
  incomingCount: number;
  outgoingCount: number;
  isLoading: boolean;
}
```

#### `useUserSearch(rawQuery: string)`

```typescript
interface UserSearchResult {
  query: string; // debounced (300ms)
  isTooShort: boolean; // < 3 chars
  isEmpty: boolean;
  isLoading: boolean;
  results: SearchResult[];
  hasResults: boolean;
}

interface SearchResult {
  user: User;
  state: 'add' | 'pending-out' | 'pending-in';
}
```

- Debounces input by 300ms
- Requires minimum 3 characters
- Cross-references with `useFriendRequests()` to show correct action state

### Mutations

| Hook                               | Action                  | Invalidates             |
| ---------------------------------- | ----------------------- | ----------------------- |
| `useSendFriendRequestMutation()`   | Send request to user    | friends, friendRequests |
| `useAcceptFriendRequestMutation()` | Accept incoming request | friends, friendRequests |
| `useRejectFriendRequestMutation()` | Reject/cancel request   | friends, friendRequests |
| `useRemoveFriendMutation()`        | Remove existing friend  | friends, friendRequests |

### Component: `FriendSelector`

```typescript
interface FriendSelectorProps {
  selectedIds: string[];
  onChange(ids: string[]): void;
  excludeIds?: string[];
  label?: string;
  searchPlaceholder?: string;
  emptyHint?: string;
}
```

- Multi-select with inline name/email search filter
- Shows "X selected" count badge
- Used in: Create Group, Add Members

---

## 5. Groups (`src/features/groups/`)

### Hooks

#### `useGroups()`

```typescript
interface GroupsResult {
  groups: Group[];
  isEmpty: boolean;
  totalGroups: number;
  isLoading: boolean;
  error: Error | null;
}
```

#### `useGroup(groupId)`

```typescript
interface GroupResult {
  group: Group | undefined;
  exists: boolean;
  isLoading: boolean;
}
```

#### `useGroupMembers(groupId)`

```typescript
interface GroupMembersResult {
  members: User[];
  isLoading: boolean;
  error: Error | null;
}
```

- Resolves full User profiles from `profiles` table
- Works even if members aren't friends (queries profiles directly)
- Cache key includes member IDs for proper invalidation

### Mutations

| Hook                                 | Action               |
| ------------------------------------ | -------------------- |
| `useCreateGroupMutation()`           | Create group via RPC |
| `useAddGroupMemberMutation(groupId)` | Add friend to group  |

### Component: `GroupCard`

```typescript
interface GroupCardProps {
  group: Group;
  balance: number;
  onPress(): void;
  isLast?: boolean;
}
```

- Icon inferred from group name (Trip→Plane, Home→House, Food→Fork, default→Briefcase)
- Balance displayed with teal (owed to you) or coral (you owe)

### Component: `AvatarStack`

```typescript
interface AvatarStackProps {
  users: { name: string; avatarUrl?: string }[];
  size?: number; // default 28
  max?: number; // default 4
}
```

- Overlapping avatar circles with "+N more" badge

---

## 6. Settlements (`src/features/settlements/`)

### Mutation: `useCreateSettlementMutation()`

```typescript
interface CreateSettlementInput {
  groupId: string;
  fromUser: string;
  toUser: string;
  amount: number;
}
```

- **Invalidates:** settlements, expenses, group, groups, all-settlements query keys
- No additional hooks — settlement data flows through the balance engine

---

## 7. Activity (`src/features/activity/`)

### Hook: `useActivity()`

```typescript
type ActivityItemType = 'EXPENSE' | 'SETTLEMENT';

interface ActivityItemData {
  id: string;
  type: ActivityItemType;
  title: string; // e.g., "You paid for pizza"
  subtitle: string; // e.g., "In Roommates"
  amount: number; // signed (+ received, - paid)
  date: string;
  groupId: string;
}

interface ActivityResult {
  activity: ActivityItemData[];
  recent: ActivityItemData[]; // top 10
  isEmpty: boolean;
  isLoading: boolean;
}
```

**Logic:**

- Fetches all expenses + settlements across user's groups
- For expenses: calculates user's share from `splitDetails`
- For settlements: uses `from/to` directly
- Unifies into single sorted array (newest first)
- `recent` is first 10 items (used on Home screen)

### Component: `ActivityItem`

```typescript
interface ActivityItemProps {
  type: 'EXPENSE' | 'SETTLEMENT' | 'SYSTEM';
  title: string;
  subtitle: string;
  amount?: number;
  payerName: string;
  date: string;
  isLast?: boolean;
  onPress?(): void;
}
```

| Type       | Icon         | Background Color       |
| ---------- | ------------ | ---------------------- |
| EXPENSE    | Receipt      | `primaryFixedDim`      |
| SETTLEMENT | CheckCircle2 | `tertiaryContainer`    |
| SYSTEM     | Bell         | `surfaceContainerHigh` |

---

## 8. Analytics (`src/features/analytics/`)

### Hook: `useGroupAnalytics(groupId)`

```typescript
interface GroupAnalytics {
  totalSpend: number;
  expenseCount: number;
  settlementCount: number;
  categoryBreakdown: CategoryBreakdownSlice[];
  memberContribution: MemberContribution[];
  spendOverTime: TimeBucket[];
  topExpense: Expense | null;
  expenses: Expense[];
  settlements: Settlement[];
  isLoading: boolean;
  isEmpty: boolean;
}

interface CategoryBreakdownSlice {
  category: CategoryId;
  amount: number;
  color: string; // theme-aware
}

interface MemberContribution {
  userId: UserId;
  paid: number; // total paid for group
  owed: number; // total owed to group
}
```

### Hook: `useFriendAnalytics(friendId)`

```typescript
interface FriendAnalytics {
  netBalance: number;
  totalSpentTogether: number;
  whoPaidMore: { me: number; friend: number };
  categoryBreakdown: FriendCategorySlice[];
  spendOverTime: TimeBucket[];
  transactions: FriendTransaction[];
  sharedExpenses: Expense[];
  isLoading: boolean;
  isEmpty: boolean;
}
```

### Time Bucketing Utility

```typescript
interface TimeBucket {
  timestamp: number;   // epoch ms
  label: string;       // "Apr 14" | "Apr 14-20" | "Apr 2026"
  total: number;       // sum of expense amounts
}

groupExpensesByDate(expenses: Expense[]): TimeBucket[]
pickGranularity(minMs, maxMs): 'day' | 'week' | 'month'
```

**Granularity logic:**

- ≤14 days → daily buckets
- ≤90 days → weekly buckets
- \>90 days → monthly buckets
- Fills empty buckets with 0 for continuous line charts

### Category Configuration

```typescript
type CategoryId = 'Food' | 'Travel' | 'Shopping' | 'Utilities' | 'Entertainment' | 'Other';

// Utilities:
toCategoryId(value?: string): CategoryId    // Safely coerce, fallback 'Other'
getCategoryColor(theme, id): string          // Theme-aware color per category
```

### Chart Components

| Component              | Chart Type                 | Library                  |
| ---------------------- | -------------------------- | ------------------------ |
| `CategoryPieChart`     | Donut + legend             | Victory Native           |
| `SpendOverTimeChart`   | Line chart + summary       | CartesianChart (Victory) |
| `ContributionBarChart` | Grouped bars               | Victory Native           |
| `TopExpenseCard`       | Static card                | —                        |
| `StatCard`             | Stat tile (label + value)  | —                        |
| `ChartCard`            | Wrapper (title + subtitle) | —                        |
| `InsightsEmptyState`   | "No data yet" placeholder  | —                        |

---

## Zustand Stores Summary

| Store              | Location               | Persistence  | State                                     |
| ------------------ | ---------------------- | ------------ | ----------------------------------------- |
| `useAuthStore`     | `features/auth/store/` | AsyncStorage | user, session, isAuthenticated, isLoading |
| `useThemeStore`    | `shared/hooks/`        | AsyncStorage | mode: 'light' \| 'dark' \| 'system'       |
| `useCurrencyStore` | `shared/hooks/`        | AsyncStorage | currency: 'INR' \| 'USD'                  |

**Pattern:** All stores use Zustand's `persist` middleware with AsyncStorage. No Redux, no Context providers needed.

---

## React Query Cache Invalidation Strategy

When a mutation succeeds, it invalidates related query keys to ensure UI consistency:

| Mutation              | Invalidates                                           |
| --------------------- | ----------------------------------------------------- |
| Create expense        | expenses, settlements, group, groups, all-expenses    |
| Create settlement     | settlements, expenses, group, groups, all-settlements |
| Send friend request   | friends, friendRequests                               |
| Accept/reject request | friends, friendRequests                               |
| Remove friend         | friends, friendRequests                               |
| Create group          | groups                                                |
| Add group member      | group, groups                                         |

---

## Related Documentation

- [Data Flow & State Management](./data-flow-and-state-management.md) — API layer, query keys, Supabase service
- [Database Schema](./database-schema.md) — Tables, RPCs, RLS policies
- [Navigation & Routing](./navigation-and-routing.md) — How screens connect to features
