export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[]; // Array of User IDs
  createdAt: string;
  coverImage?: string;
}

export interface ExpenseSplit {
  userId: string;
  value: number;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  payerId: string;
  date: string;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
  splits: ExpenseSplit[];
  receiptUrl?: string;
  category?: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  addedAt: string;
}

export interface Balance {
  userId: string;
  amount: number;
}
