import { Expense, Group, Settlement, User } from '@/shared/types';

/**
 * Demo dataset used by `seedDemoData()` in `src/shared/data/seedDemoData.ts`.
 *
 * The current user's id is `usr_1` to match the value set by
 * `AuthScreen.handleLogin()` in `src/app/(auth)/index.tsx` so that after
 * seeding, balance calculations from `useBalances()` attribute amounts to
 * the logged-in user correctly.
 *
 * The legacy `MOCK_MEMBERS` / `MOCK_GROUPS` / `MOCK_EXPENSES` exports are
 * kept as thin aliases of the typed Demo constants below. They are still
 * imported (but unused) by the three Zustand store files; preserving them
 * avoids touching those files for this demo-data change.
 */

export const DEMO_CURRENT_USER: User = {
  id: 'usr_1',
  name: 'Rashmi Ranjan',
  email: 'rashmi@example.com',
};

export const DEMO_FRIENDS: User[] = [
  { id: 'usr_2', name: 'Sarah K.', email: 'sarah@example.com' },
  { id: 'usr_3', name: 'James R.', email: 'james@example.com' },
  { id: 'usr_4', name: 'Mia T.', email: 'mia@example.com' },
  { id: 'usr_5', name: 'Arjun P.', email: 'arjun@example.com' },
];

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();

export const DEMO_GROUPS: Group[] = [
  {
    id: 'grp_trip',
    name: 'Goa Weekend 🏖',
    description: 'April trip to Goa with the crew',
    members: ['usr_1', 'usr_2', 'usr_3', 'usr_4'],
    createdAt: daysAgo(14),
  },
  {
    id: 'grp_home',
    name: 'Apartment 🏠',
    description: 'Rent, utilities, groceries',
    members: ['usr_1', 'usr_5', 'usr_2'],
    createdAt: daysAgo(90),
  },
  {
    id: 'grp_dinner',
    name: 'Foodies 🍽',
    description: 'Restaurant and delivery splits',
    members: ['usr_1', 'usr_3', 'usr_4'],
    createdAt: daysAgo(45),
  },
];

/** Equal-split helper to keep expense definitions terse. */
const equalSplit = (participants: string[], total: number) => {
  const share = total / participants.length;
  return participants.map((userId) => ({ userId, owedAmount: share }));
};

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    groupId: 'grp_trip',
    title: 'Flight tickets',
    amount: 24000,
    paidBy: 'usr_1',
    participants: ['usr_1', 'usr_2', 'usr_3', 'usr_4'],
    splitDetails: equalSplit(['usr_1', 'usr_2', 'usr_3', 'usr_4'], 24000),
    splitType: 'EQUAL',
    category: 'Travel',
    createdAt: daysAgo(12),
  },
  {
    id: 'exp_2',
    groupId: 'grp_trip',
    title: 'Villa stay',
    amount: 18000,
    paidBy: 'usr_2',
    participants: ['usr_1', 'usr_2', 'usr_3', 'usr_4'],
    splitDetails: equalSplit(['usr_1', 'usr_2', 'usr_3', 'usr_4'], 18000),
    splitType: 'EQUAL',
    category: 'Travel',
    createdAt: daysAgo(10),
  },
  {
    id: 'exp_3',
    groupId: 'grp_home',
    title: 'Groceries',
    amount: 4500,
    paidBy: 'usr_1',
    participants: ['usr_1', 'usr_5', 'usr_2'],
    splitDetails: equalSplit(['usr_1', 'usr_5', 'usr_2'], 4500),
    splitType: 'EQUAL',
    category: 'Shopping',
    createdAt: daysAgo(6),
  },
  {
    id: 'exp_4',
    groupId: 'grp_home',
    title: 'Electricity bill',
    amount: 2200,
    paidBy: 'usr_5',
    participants: ['usr_1', 'usr_5', 'usr_2'],
    splitDetails: equalSplit(['usr_1', 'usr_5', 'usr_2'], 2200),
    splitType: 'EQUAL',
    category: 'Utilities',
    createdAt: daysAgo(4),
  },
  {
    id: 'exp_5',
    groupId: 'grp_dinner',
    title: 'Sushi night',
    amount: 3200,
    paidBy: 'usr_3',
    participants: ['usr_1', 'usr_3', 'usr_4'],
    splitDetails: equalSplit(['usr_1', 'usr_3', 'usr_4'], 3200),
    splitType: 'EQUAL',
    category: 'Food',
    createdAt: daysAgo(8),
  },
  {
    id: 'exp_6',
    groupId: 'grp_dinner',
    title: 'Coffee run',
    amount: 420,
    paidBy: 'usr_1',
    participants: ['usr_1', 'usr_3', 'usr_4'],
    splitDetails: equalSplit(['usr_1', 'usr_3', 'usr_4'], 420),
    splitType: 'EQUAL',
    category: 'Food',
    createdAt: daysAgo(3),
  },
  {
    id: 'exp_7',
    groupId: 'grp_trip',
    title: 'Scooter rental',
    amount: 1600,
    paidBy: 'usr_1',
    participants: ['usr_1', 'usr_2', 'usr_3', 'usr_4'],
    splitDetails: equalSplit(['usr_1', 'usr_2', 'usr_3', 'usr_4'], 1600),
    splitType: 'EQUAL',
    category: 'Travel',
    createdAt: daysAgo(9),
  },
  {
    id: 'exp_8',
    groupId: 'grp_dinner',
    title: 'Movie tickets',
    amount: 900,
    paidBy: 'usr_4',
    participants: ['usr_1', 'usr_3', 'usr_4'],
    splitDetails: equalSplit(['usr_1', 'usr_3', 'usr_4'], 900),
    splitType: 'EQUAL',
    category: 'Entertainment',
    createdAt: daysAgo(2),
  },
];

export const DEMO_SETTLEMENTS: Settlement[] = [
  {
    id: 'set_1',
    groupId: 'grp_home',
    from: 'usr_1',
    to: 'usr_5',
    amount: 500,
    createdAt: daysAgo(1),
  },
];

// --- Legacy aliases ---
// Three Zustand store files still `import` these identifiers but do not use
// them for seeding. The aliases below keep those imports compiling without
// needing to touch the store files.
export const MOCK_CURRENT_USER: User = DEMO_CURRENT_USER;
export const MOCK_MEMBERS: User[] = DEMO_FRIENDS;
export const MOCK_GROUPS: Group[] = DEMO_GROUPS;
export const MOCK_EXPENSES: Expense[] = DEMO_EXPENSES;
export const GROUP_MAP = new Map<string, Group>(DEMO_GROUPS.map((g) => [g.id, g]));
export const MEMBER_MAP = new Map<string, User>(DEMO_FRIENDS.map((m) => [m.id, m]));
