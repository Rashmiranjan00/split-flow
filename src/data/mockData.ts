import { Group, Expense, User } from '@/types';

export const MOCK_CURRENT_USER: User = {
  id: 'usr_1',
  name: 'Demo User',
  email: 'demo@splitflow.com',
};

export const MOCK_MEMBERS: User[] = [
  { id: 'usr_1', name: 'You', email: 'demo@splitflow.com' },
  { id: 'usr_2', name: 'Sarah K.', email: 'sarah@example.com' },
  { id: 'usr_3', name: 'James R.', email: 'james@example.com' },
  { id: 'usr_4', name: 'Mia T.', email: 'mia@example.com' },
  { id: 'usr_5', name: 'Liam B.', email: 'liam@example.com' },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Summer Trip 🏖',
    description: 'Bali 2026 crew',
    members: ['usr_1', 'usr_2', 'usr_3', 'usr_4'],
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'g2',
    name: 'Apartment 🏠',
    description: 'Monthly household expenses',
    members: ['usr_1', 'usr_3', 'usr_5'],
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'g3',
    name: 'Dinner Club 🍽',
    description: 'Weekly dinners',
    members: ['usr_1', 'usr_2', 'usr_5'],
    createdAt: '2026-02-10T00:00:00Z',
  },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    groupId: 'g1',
    title: 'Villa Booking',
    amount: 1_200,
    payerId: 'usr_1',
    date: '2026-03-15T00:00:00Z',
    splitType: 'EQUAL',
    splits: [
      { userId: 'usr_1', value: 300 },
      { userId: 'usr_2', value: 300 },
      { userId: 'usr_3', value: 300 },
      { userId: 'usr_4', value: 300 },
    ],
    category: 'Accommodation',
  },
  {
    id: 'exp_2',
    groupId: 'g1',
    title: 'Airport Transfers',
    amount: 160,
    payerId: 'usr_2',
    date: '2026-03-14T00:00:00Z',
    splitType: 'EQUAL',
    splits: [
      { userId: 'usr_1', value: 40 },
      { userId: 'usr_2', value: 40 },
      { userId: 'usr_3', value: 40 },
      { userId: 'usr_4', value: 40 },
    ],
    category: 'Transport',
  },
  {
    id: 'exp_3',
    groupId: 'g1',
    title: 'Dinner at Nobu',
    amount: 420,
    payerId: 'usr_3',
    date: '2026-03-16T00:00:00Z',
    splitType: 'EQUAL',
    splits: [
      { userId: 'usr_1', value: 105 },
      { userId: 'usr_2', value: 105 },
      { userId: 'usr_3', value: 105 },
      { userId: 'usr_4', value: 105 },
    ],
    category: 'Food',
  },
  {
    id: 'exp_4',
    groupId: 'g2',
    title: 'Monthly Rent',
    amount: 2_400,
    payerId: 'usr_1',
    date: '2026-04-01T00:00:00Z',
    splitType: 'EQUAL',
    splits: [
      { userId: 'usr_1', value: 800 },
      { userId: 'usr_3', value: 800 },
      { userId: 'usr_5', value: 800 },
    ],
    category: 'Housing',
  },
  {
    id: 'exp_5',
    groupId: 'g2',
    title: 'Electricity Bill',
    amount: 180,
    payerId: 'usr_3',
    date: '2026-04-02T00:00:00Z',
    splitType: 'EQUAL',
    splits: [
      { userId: 'usr_1', value: 60 },
      { userId: 'usr_3', value: 60 },
      { userId: 'usr_5', value: 60 },
    ],
    category: 'Utilities',
  },
  {
    id: 'exp_6',
    groupId: 'g3',
    title: 'Italian Restaurant',
    amount: 230,
    payerId: 'usr_2',
    date: '2026-04-05T00:00:00Z',
    splitType: 'EQUAL',
    splits: [
      { userId: 'usr_1', value: 76.67 },
      { userId: 'usr_2', value: 76.67 },
      { userId: 'usr_5', value: 76.67 },
    ],
    category: 'Food',
  },
  {
    id: 'exp_7',
    groupId: 'g3',
    title: 'Wine & Cheese Night',
    amount: 95,
    payerId: 'usr_1',
    date: '2026-04-08T00:00:00Z',
    splitType: 'EQUAL',
    splits: [
      { userId: 'usr_1', value: 31.67 },
      { userId: 'usr_2', value: 31.67 },
      { userId: 'usr_5', value: 31.67 },
    ],
    category: 'Food',
  },
];

/** Lookup Maps (ES2019 Map for O(1) access vs repeated .find()) */
export const MEMBER_MAP = new Map(MOCK_MEMBERS.map(m => [m.id, m]));
export const GROUP_MAP = new Map(MOCK_GROUPS.map(g => [g.id, g]));

/** Calculate net balance for current user (positive = owed to you, negative = you owe) */
export const getGroupBalance = (groupId: string, currentUserId = 'usr_1'): number => {
  return MOCK_EXPENSES
    .filter(e => e.groupId === groupId)
    .reduce((balance, expense) => {
      const myShare = expense.splits.find(s => s.userId === currentUserId)?.value ?? 0;
      return expense.payerId === currentUserId
        ? balance + (expense.amount - myShare)  // I paid — owed the rest
        : balance - myShare;                     // Someone else paid — I owe my share
    }, 0);
}

/** Total balance across all groups */
export const getTotalBalance = (currentUserId = 'usr_1'): number =>
  MOCK_GROUPS.reduce(
    (total, group) => total + getGroupBalance(group.id, currentUserId),
    0
  );

/** Per-user balances: who owes who how much within a group */
export const getGroupMemberBalances = (
  groupId: string,
  currentUserId = 'usr_1'
): { userId: string; name: string; amount: number }[] => {
  const group = GROUP_MAP.get(groupId);
  if (!group) return [];

  // Build a net balance map using reduce (no forEach mutation)
  const balanceMap = MOCK_EXPENSES
    .filter(e => e.groupId === groupId)
    .reduce<Record<string, number>>((acc, expense) => {
      for (const split of expense.splits) {
        if (split.userId === expense.payerId) continue;

        if (expense.payerId === currentUserId) {
          // Others owe me — ES2021 ??= to initialise
          acc[split.userId] ??= 0;
          acc[split.userId] += split.value;
        } else if (split.userId === currentUserId) {
          // I owe payer
          acc[expense.payerId] ??= 0;
          acc[expense.payerId] -= split.value;
        }
      }
      return acc;
    }, {});

  return Object.entries(balanceMap)
    .filter(([id]) => id !== currentUserId)
    .map(([userId, amount]) => ({
      userId,
      name: MEMBER_MAP.get(userId)?.name ?? userId,  // O(1) Map lookup
      amount,
    }));
}

/** Spending by category — Object.fromEntries (ES2019) + reduce pipeline */
export const getSpendingByCategory = (
  currentUserId = 'usr_1'
): { category: string; amount: number; color: string }[] => {
  const categoryColors: Record<string, string> = {
    Food: '#3cddc7',
    Transport: '#95d3ba',
    Accommodation: '#c0c6de',
    Utilities: '#f59e0b',
    Housing: '#ef4444',
    Other: '#6b7280',
  };

  const totals = MOCK_EXPENSES.reduce<Record<string, number>>((acc, expense) => {
    const myShare = expense.splits.find(s => s.userId === currentUserId)?.value ?? 0;
    const cat = expense.category ?? 'Other';
    acc[cat] ??= 0;  // ES2021 logical nullish assignment
    acc[cat] += myShare;
    return acc;
  }, {});

  return Object.entries(totals).map(([category, amount]) => ({
    category,
    amount,
    color: categoryColors[category] ?? categoryColors['Other'],
  }));
}

/** Monthly spending totals (last 6 months mock) */
export const MONTHLY_SPENDING = [
  { month: 'Nov', amount: 340 },
  { month: 'Dec', amount: 620 },
  { month: 'Jan', amount: 198 },
  { month: 'Feb', amount: 455 },
  { month: 'Mar', amount: 880 },
  { month: 'Apr', amount: 328 },
] as const;
