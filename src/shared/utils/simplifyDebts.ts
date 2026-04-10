import { Balance, UserId } from '@/shared/types';

/**
 * Debt Simplification Algorithm (Minimal Transaction)
 * 1. Match largest creditor with largest debtor
 * 2. Create a transaction
 * 3. Update their balances
 * 4. Repeat until all balances settled
 */
export const simplifyDebts = (netPositions: Record<UserId, number>): Balance[] => {
  const simplified: Balance[] = [];

  // Filter out users with zero balance
  const debtors = Object.entries(netPositions)
    .filter(([_, amount]) => amount < 0)
    .map(([id, amount]) => ({ id, amount: Math.abs(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(netPositions)
    .filter(([_, amount]) => amount > 0)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      simplified.push({
        from: debtor.id,
        to: creditor.id,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  return simplified;
};
