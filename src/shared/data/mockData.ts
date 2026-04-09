import { Group, Expense, User, ExpenseSplit } from '@/shared/types';

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

export const getTotalBalance = (userId: string): number => {
  return MOCK_EXPENSES.reduce((acc, expense) => {
    const mySplit = expense.splits.find((s: ExpenseSplit) => s.userId === userId);
    if (!mySplit) return acc;
    
    if (expense.payerId === userId) {
      return acc + (expense.amount - mySplit.value);
    } else {
      return acc - mySplit.value;
    }
  }, 0);
};

export const getGroupBalance = (groupId: string, userId: string): number => {
  return MOCK_EXPENSES
    .filter(e => e.groupId === groupId)
    .reduce((acc, expense) => {
      const mySplit = expense.splits.find((s: ExpenseSplit) => s.userId === userId);
      if (!mySplit) return acc;
      
      if (expense.payerId === userId) {
        return acc + (expense.amount - mySplit.value);
      } else {
        return acc - mySplit.value;
      }
    }, 0);
};

export const getGroupMemberBalances = (groupId: string, currentUserId: string): { userId: string; name: string; amount: number }[] => {
  const group = MOCK_GROUPS.find(g => g.id === groupId);
  if (!group) return [];

  const balances: Record<string, number> = {};
  
  MOCK_EXPENSES
    .filter(e => e.groupId === groupId)
    .forEach(expense => {
      const mySplit = expense.splits.find((s: ExpenseSplit) => s.userId === currentUserId)?.value ?? 0;
      
      if (expense.payerId === currentUserId) {
        expense.splits.forEach((s: ExpenseSplit) => {
          if (s.userId !== currentUserId) {
            balances[s.userId] = (balances[s.userId] || 0) + s.value;
          }
        });
      } else {
        const myActualSplit = expense.splits.find((s: ExpenseSplit) => s.userId === currentUserId)?.value ?? 0;
        balances[expense.payerId] = (balances[expense.payerId] || 0) - myActualSplit;
      }
    });

  return Object.entries(balances).map(([userId, amount]) => ({
    userId,
    name: MOCK_MEMBERS.find(m => m.id === userId)?.name ?? 'Someone',
    amount,
  }));
};

/** Spending by category — Object.fromEntries (ES2019) + reduce pipeline */
export const getSpendingByCategory = (
  currentUserId = 'usr_1'
): { category: string; amount: number; color: string }[] => {
  const categoryColors: Record<string, string> = {
    Food: '#ffb783',       // Luxe tertiary (amber)
    Transport: '#c0c1ff',  // Luxe primary (indigo)
    Accommodation: '#c7c4d7', // Luxe onSurfaceVariant
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
