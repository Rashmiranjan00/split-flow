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

/**
 * Validates and calculates the exact amount owed by each participant based on the split type
 */
export const calculateSplits = (expense: ExpenseData): Record<string, number> => {
  const { totalAmount, splitType, splits } = expense;
  const owedAmounts: Record<string, number> = {};
  
  if (splitType === 'EQUAL') {
    const amountPerPerson = Number((totalAmount / splits.length).toFixed(2));
    // To handle precision issues (e.g. 100/3 = 33.33 => 99.99), we adjust the first person
    let sum = 0;
    splits.forEach(s => {
      owedAmounts[s.userId] = amountPerPerson;
      sum += amountPerPerson;
    });
    const difference = Number((totalAmount - sum).toFixed(2));
    if (difference !== 0 && splits.length > 0) {
      owedAmounts[splits[0].userId] = Number((owedAmounts[splits[0].userId] + difference).toFixed(2));
    }
  } else if (splitType === 'PERCENTAGE') {
    let totalPercent = 0;
    splits.forEach(s => totalPercent += s.value);
    if (Math.abs(totalPercent - 100) > 0.01) throw new Error("Percentages must add up to 100%");
    
    let sum = 0;
    splits.forEach(s => {
      const amount = Number(((s.value / 100) * totalAmount).toFixed(2));
      owedAmounts[s.userId] = amount;
      sum += amount;
    });
    
    const difference = Number((totalAmount - sum).toFixed(2));
    if (difference !== 0 && splits.length > 0) {
       owedAmounts[splits[0].userId] = Number((owedAmounts[splits[0].userId] + difference).toFixed(2));
    }
  } else if (splitType === 'SHARES') {
    let totalShares = 0;
    splits.forEach(s => totalShares += s.value);
    
    let sum = 0;
    splits.forEach(s => {
      const amount = Number(((s.value / totalShares) * totalAmount).toFixed(2));
      owedAmounts[s.userId] = amount;
      sum += amount;
    });
    
    const difference = Number((totalAmount - sum).toFixed(2));
    if (difference !== 0 && splits.length > 0) {
       owedAmounts[splits[0].userId] = Number((owedAmounts[splits[0].userId] + difference).toFixed(2));
    }
  } else if (splitType === 'EXACT') {
    let sum = 0;
    splits.forEach(s => {
      owedAmounts[s.userId] = s.value;
      sum += s.value;
    });
    if (Math.abs(sum - totalAmount) > 0.01) throw new Error("Exact amounts must add up to total amount");
  }

  return owedAmounts;
};

/**
 * Calculates simplified debts (Minimal Transactions)
 */
export const simplifyDebts = (expenses: ExpenseData[]): Debt[] => {
  const netBalances: Record<string, number> = {};

  // For every expense, payer gets positive balance, participants get negative balance
  expenses.forEach(exp => {
    if (!netBalances[exp.payerId]) netBalances[exp.payerId] = 0;
    netBalances[exp.payerId] += exp.totalAmount;

    const splits = calculateSplits(exp);
    for (const [userId, amount] of Object.entries(splits)) {
      if (!netBalances[userId]) netBalances[userId] = 0;
      netBalances[userId] -= amount;
    }
  });

  // Separate creditors (balance > 0) and debtors (balance < 0)
  interface Balance {
    userId: string;
    amount: number;
  }

  const creditors: Balance[] = [];
  const debtors: Balance[] = [];

  for (const [userId, amount] of Object.entries(netBalances)) {
    if (amount > 0.01) creditors.push({ userId, amount: Number(amount.toFixed(2)) });
    else if (amount < -0.01) debtors.push({ userId, amount: Number(Math.abs(amount).toFixed(2)) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts: Debt[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    simplifiedDebts.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: Number(settledAmount.toFixed(2))
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return simplifiedDebts;
};
