export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

export interface Participant {
  id: string;
  name?: string;
}

export interface SplitInput {
  userId: string;
  value: number; // Value corresponds to the exact amount, percentage, or shares
}

export interface ExpenseData {
  payerId: string;
  totalAmount: number;
  splitType: SplitType;
  splits: SplitInput[];
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

// Moved out of function body — clean module-level type
interface Balance {
  userId: string;
  amount: number;
}

/** Round a number to 2 decimal places */
const round2 = (n: number): number => Number(n.toFixed(2));

/**
 * Validates and calculates the exact amount owed by each participant
 * based on the split type. Uses Object.fromEntries (ES2019) for declarative
 * object construction and Array.at() (ES2022) for safe first-element access.
 */
export const calculateSplits = (expense: ExpenseData): Record<string, number> => {
  const { totalAmount, splitType, splits } = expense;

  if (splitType === 'EQUAL') {
    const amountPerPerson = round2(totalAmount / splits.length);
    const initial = Object.fromEntries(splits.map(s => [s.userId, amountPerPerson]));

    // Precision correction: adjust the first participant for rounding drift
    const sum = splits.reduce((acc) => acc + amountPerPerson, 0);
    const diff = round2(totalAmount - sum);
    const firstId = splits.at(0)?.userId;
    if (diff !== 0 && firstId) initial[firstId] = round2(initial[firstId] + diff);

    return initial;
  }

  if (splitType === 'PERCENTAGE') {
    const totalPercent = splits.reduce((acc, s) => acc + s.value, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new Error('Percentages must add up to 100%');
    }

    const result = Object.fromEntries(
      splits.map(s => [s.userId, round2((s.value / 100) * totalAmount)])
    );
    const sum = Object.values(result).reduce((acc, v) => acc + v, 0);
    const diff = round2(totalAmount - sum);
    const firstId = splits.at(0)?.userId;
    if (diff !== 0 && firstId) result[firstId] = round2(result[firstId] + diff);

    return result;
  }

  if (splitType === 'SHARES') {
    const totalShares = splits.reduce((acc, s) => acc + s.value, 0);

    const result = Object.fromEntries(
      splits.map(s => [s.userId, round2((s.value / totalShares) * totalAmount)])
    );
    const sum = Object.values(result).reduce((acc, v) => acc + v, 0);
    const diff = round2(totalAmount - sum);
    const firstId = splits.at(0)?.userId;
    if (diff !== 0 && firstId) result[firstId] = round2(result[firstId] + diff);

    return result;
  }

  // EXACT
  const result = Object.fromEntries(splits.map(s => [s.userId, s.value]));
  const sum = splits.reduce((acc, s) => acc + s.value, 0);
  if (Math.abs(sum - totalAmount) > 0.01) {
    throw new Error('Exact amounts must add up to total amount');
  }

  return result;
};

/**
 * Calculates simplified debts using minimal transactions algorithm.
 * Uses ??= logical assignment (ES2021) and for...of with Object.entries.
 */
export const simplifyDebts = (expenses: ExpenseData[]): Debt[] => {
  const netBalances: Record<string, number> = {};

  for (const exp of expenses) {
    // ES2021 logical nullish assignment — init to 0 only if not yet set
    netBalances[exp.payerId] ??= 0;
    netBalances[exp.payerId] += exp.totalAmount;

    const splits = calculateSplits(exp);
    for (const [userId, amount] of Object.entries(splits)) {
      netBalances[userId] ??= 0;
      netBalances[userId] -= amount;
    }
  }

  const creditors: Balance[] = [];
  const debtors: Balance[] = [];

  for (const [userId, amount] of Object.entries(netBalances)) {
    if (amount > 0.01) creditors.push({ userId, amount: round2(amount) });
    else if (amount < -0.01) debtors.push({ userId, amount: round2(Math.abs(amount)) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts: Debt[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    simplifiedDebts.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: round2(settledAmount),
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return simplifiedDebts;
};
