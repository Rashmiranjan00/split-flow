# UI Component Library

> Shared components, typography, theme system, and design tokens.

---

## Shared Components (`src/shared/components/`)

### ActionButton

Reusable button with 3 variants and optional icon.

```typescript
interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  icon?: LucideIcon;
  style?: ViewStyle;
}
```

| Variant     | Background                      | Text Color               |
| ----------- | ------------------------------- | ------------------------ |
| `primary`   | `theme.colors.primary`          | `theme.colors.onPrimary` |
| `secondary` | `theme.colors.surfaceContainer` | `theme.colors.onSurface` |
| `outline`   | transparent (1px border)        | `theme.colors.primary`   |

**Specs:** 50px height, 12px border-radius, horizontal padding 20px.

---

### Avatar

Circular avatar with initials fallback or image.

```typescript
interface AvatarProps {
  name: string;
  size?: number; // Default: 40 (Spacing.avatarMd)
  borderWidth?: number;
  borderColor?: string;
  imageUrl?: string;
}
```

- Extracts first letter of `name` as initial (uppercase)
- Falls back to "U" if name is undefined
- Background: `primaryFixedDim` (light mint)
- Text: `brandDark` (dark teal)
- Canonical sizes: `avatarSm` (32), `avatarMd` (40), `avatarLg` (56)

---

### BalanceCard

Large hero balance display for Home screen.

```typescript
interface BalanceCardProps {
  totalBalance: number;
  totalOwedToYou?: number;
  totalYouOwe?: number;
}
```

- Uses `HeroBalance` typography (48px bold)
- Two breakout pills: teal dot for "owed to you", coral dot for "you owe"
- Formatted via `useCurrencyFormatter()` hook

---

### Layout Primitives

Exported from `Layout.tsx`:

| Component         | Purpose                                 | Key Props            |
| ----------------- | --------------------------------------- | -------------------- |
| `SafeScreen`      | SafeAreaView for top-level screens      | —                    |
| `Screen`          | Regular View container for tab layouts  | —                    |
| `Content`         | ScrollView with bottom padding (20px)   | —                    |
| `Row`             | Flex row, center-aligned, bottom margin | —                    |
| `SpaceBetweenRow` | Row with `space-between`                | —                    |
| `Column`          | Flex column                             | —                    |
| `Spacer`          | Configurable gap                        | `size`, `horizontal` |
| `SurfaceCard`     | Card with 16px radius, divider shadow   | —                    |

#### SectionHeader

```typescript
interface SectionHeaderProps {
  label: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}
```

Header with optional right-aligned action link (primary color, 13px).

#### TxnRow (Transaction Row)

```typescript
interface TxnRowProps extends TouchableOpacityProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  isLast?: boolean;
}
```

Standard list row: leading (avatar/icon) → center (title + subtitle) → trailing (amount).
1px indented divider (72px from left) except on last row.

---

### Screen

SafeAreaView wrapper with StatusBar.

```typescript
interface ScreenProps {
  children: React.ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}
```

Default edges: `['top']`. StatusBar style: `dark`.

---

### ScreenTabs

In-screen segmented tab bar (not navigation tabs).

```typescript
interface ScreenTabsItem {
  id: string;
  label: string;
}

interface ScreenTabsProps {
  tabs: ScreenTabsItem[];
  activeId: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
}
```

- Controlled component (parent owns `activeId`)
- Used in Group Detail and Friend Detail for switching sections
- Horizontal pill buttons on light-gray background
- Active = semibold, inactive = medium weight

---

## Typography System (`src/shared/components/Typography.tsx`)

All text components are styled-components with theme-aware colors:

### General Typography

| Component  | Size | Weight | Use Case                                |
| ---------- | ---- | ------ | --------------------------------------- |
| `Display`  | 32px | 700    | Page titles, large numbers              |
| `Headline` | 24px | 700    | Section headers                         |
| `Title`    | 17px | 600    | Card titles, row labels                 |
| `BodyMd`   | 15px | 400    | Body text                               |
| `BodySm`   | 13px | 400    | Secondary text                          |
| `Label`    | 12px | 600    | Uppercase labels (0.8px letter-spacing) |

### Finance-Specific Typography

| Component      | Size | Weight | Color Logic                         |
| -------------- | ---- | ------ | ----------------------------------- |
| `HeroBalance`  | 48px | 700    | Teal if positive, coral if negative |
| `Amount`       | 15px | 600    | Teal if positive, coral if negative |
| `SectionLabel` | 13px | 600    | Gray-green, uppercase               |
| `RowTitle`     | 15px | 500    | Default text color                  |
| `RowSubtitle`  | 13px | 400    | Gray                                |
| `Timestamp`    | 11px | 400    | Light gray                          |

---

## Theme System

### Color Tokens (`src/shared/constants/themes.ts`)

```typescript
interface ThemeColors {
  // Surfaces
  background: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Brand
  primary: string;
  onPrimary: string;
  primaryFixedDim: string;
  brandAccent: string;
  brandDark: string;

  // Semantic
  tertiary: string;
  tertiaryContainer: string;
  error: string;
  danger: string;
  dangerLight: string;
  secondary: string;

  // Text
  onSurface: string;
  onSurfaceVariant: string;

  // Borders
  divider: string;
  outlineVariant: string;
}
```

### Light Theme (`ClearLight`)

| Token              | Value     | Usage                                   |
| ------------------ | --------- | --------------------------------------- |
| `background`       | `#FCF9F8` | Warm cream page background              |
| `primary`          | `#006C4F` | Teal — buttons, links, positive amounts |
| `brandAccent`      | `#00C896` | Vibrant teal — FAB, highlights          |
| `brandDark`        | `#004D38` | Dark teal — avatar text                 |
| `error` / `danger` | `#FF6B6B` | Warm coral — negative amounts, errors   |
| `surface`          | `#FFFFFF` | Card backgrounds                        |
| `onSurface`        | `#1C1B1F` | Primary text                            |
| `onSurfaceVariant` | `#49454F` | Secondary text                          |
| `divider`          | `#E5E2E1` | List separators                         |
| `primaryFixedDim`  | `#C8F5E5` | Light mint — avatar backgrounds         |

### Dark Theme (`ClearDark`)

| Token              | Value     | Usage                      |
| ------------------ | --------- | -------------------------- |
| `background`       | `#131313` | Near-black page background |
| `primary`          | `#42E5B0` | Light teal for readability |
| `error` / `danger` | `#FFB4AB` | Muted pink                 |
| `surface`          | `#1E1E1E` | Card backgrounds           |
| `onSurface`        | `#E6E1E5` | Primary text               |
| `divider`          | `#353534` | List separators            |

### Theme Switching

```typescript
// Zustand store
type ThemeMode = 'light' | 'dark' | 'system';

const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'system', // Default
      setMode: (mode: ThemeMode) => set({ mode }),
    }),
    { name: 'splitflow-theme', storage: zustandStorage }
  )
);
```

Resolved in root layout using device color scheme when mode is `'system'`.

### Styled-Components Theme Augmentation

```typescript
// src/shared/types/styled.d.ts
declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: ThemeColors;
    isDark: boolean;
  }
}
```

---

## Spacing & Radius Tokens (`src/shared/constants/spacing.ts`)

### Spacing Scale

```typescript
const Spacing = {
  // Base scale (4px increments)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Named aliases
  screenPadding: 20,
  edgeMargin: 20,
  rowVertical: 12,
  sectionGap: 8,
  gutter: 12,

  // FAB
  fabSize: 52,
  fabBottom: 88,
  fabRight: 20,

  // Avatars
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
};
```

### Border Radius

```typescript
const Radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,

  // Named aliases
  inputRadius: 12,
  buttonRadius: 12,
  cardRadius: 16,
  sheetRadius: 16,
};
```

---

## Typography Scale (`src/shared/constants/typography.ts`)

```typescript
const Typography = {
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  sizes: {
    displayLg: 48,
    displayMd: 40,
    displaySm: 32,
    headlineLg: 28,
    headlineMd: 24,
    headlineSm: 20,
    titleLg: 20,
    titleMd: 17,
    titleSm: 15,
    bodyLg: 16,
    bodyMd: 15,
    bodySm: 13,
    labelLg: 13,
    labelMd: 12,
    labelSm: 11,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

---

## Feature-Specific Components

### Expenses Feature

| Component               | Props                                           | Purpose                                |
| ----------------------- | ----------------------------------------------- | -------------------------------------- |
| `EqualSplitEditor`      | participants, allMembers, onToggle, totalAmount | Toggle switch per member, auto-splits  |
| `ExactSplitEditor`      | splitDetails, onUpdate, totalAmount             | Text input per person, shows remaining |
| `PercentageSplitEditor` | splitDetails, onUpdate, totalAmount             | % input, calculated amount display     |
| `SharesSplitEditor`     | splitDetails, onUpdate, totalAmount             | Share count inputs                     |
| `ParticipantSelector`   | —                                               | Horizontal scrollable avatar picker    |
| `PaidBySelector`        | —                                               | Radio-style member list                |
| `CategorySelector`      | —                                               | 6 icon buttons (Food, Travel, etc.)    |
| `SplitPreviewCard`      | —                                               | Debt preview before saving             |
| `ReceiptUploader`       | —                                               | Image picker with preview              |
| `ExpenseCard`           | —                                               | Transaction row (list item)            |

### Analytics Feature

| Component              | Props                       | Chart Library                        |
| ---------------------- | --------------------------- | ------------------------------------ |
| `CategoryPieChart`     | data, theme                 | Victory Native (Pie)                 |
| `SpendOverTimeChart`   | data, theme                 | Victory Native (CartesianChart/Line) |
| `ContributionBarChart` | data, theme                 | Victory Native (Bar)                 |
| `TopExpenseCard`       | expense, category           | —                                    |
| `StatCard`             | label, value, tone, caption | —                                    |
| `ChartCard`            | title, subtitle, children   | —                                    |
| `InsightsEmptyState`   | —                           | —                                    |

### Friends Feature

| Component        | Props                                    | Purpose                         |
| ---------------- | ---------------------------------------- | ------------------------------- |
| `FriendSelector` | selectedIds, onChange, excludeIds, label | Multi-select with search filter |

### Groups Feature

| Component     | Props                           | Purpose                             |
| ------------- | ------------------------------- | ----------------------------------- |
| `GroupCard`   | group, balance, onPress, isLast | Group list item with icon + balance |
| `AvatarStack` | users, size, max                | Overlapping avatar circles          |

### Activity Feature

| Component      | Props                               | Purpose                           |
| -------------- | ----------------------------------- | --------------------------------- |
| `ActivityItem` | type, title, subtitle, amount, date | Activity feed list item with icon |

---

## Icon System

Uses `lucide-react-native` for all icons. Common icons:

| Context     | Icons Used                               |
| ----------- | ---------------------------------------- |
| Tabs        | Home, Users, Layers, Clock, User         |
| Expenses    | Receipt, Plus, Camera                    |
| Settlements | CheckCircle2, ArrowRight                 |
| Groups      | Plane, House, UtensilsCrossed, Briefcase |
| Friends     | UserPlus, Inbox, Search, X               |
| Analytics   | TrendingUp, PieChart, BarChart3          |
| System      | Bell, Settings, LogOut, ChevronLeft      |

---

## Related Documentation

- [Architecture Overview](./architecture-overview.md) — Theme configuration files
- [Features & Domain Logic](./features-and-domain-logic.md) — Feature component details
- [Navigation & Routing](./navigation-and-routing.md) — Where components are used
