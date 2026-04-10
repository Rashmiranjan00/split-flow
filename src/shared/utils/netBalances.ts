import { Balance } from '@/shared/types';

/**
 * Users may owe each other simultaneously.
 * Algorithm:
 * 1. Compare opposite debts (A -> B and B -> A)
 * 2. Cancel out smaller value
 * 3. Keep only net balance
 */
export const netBalances = (balances: Balance[]): Balance[] => {
  const result: Balance[] = [];
  const processed = new Set<string>();

  const findBalance = (from: string, to: string) => 
    balances.find(b => b.from === from && b.to === to);

  balances.forEach((b) => {
    const key = `${b.from}_${b.to}`;
    const reverseKey = `${b.to}_${b.from}`;

    if (processed.has(key) || processed.has(reverseKey)) return;

    const reverse = findBalance(b.to, b.from);

    if (reverse) {
      if (b.amount > reverse.amount) {
        result.push({ from: b.from, to: b.to, amount: b.amount - reverse.amount });
      } else if (reverse.amount > b.amount) {
        result.push({ from: reverse.from, to: reverse.to, amount: reverse.amount - b.amount });
      }
      // If equal, they cancel out, push nothing
    } else {
      result.push(b);
    }

    processed.add(key);
    processed.add(reverseKey);
  });

  return result;
};
