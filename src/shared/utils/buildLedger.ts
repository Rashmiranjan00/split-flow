import { Expense, Settlement, Balance } from '@/shared/types';
import { toCents } from './money';

/**
 * Convert each expense and settlement into ledger entries.
 * Settlements are treated as reverse ledger entries.
 */
export const buildLedger = (expenses: Expense[], settlements: Settlement[] = []): Balance[] => {
  const ledger: Balance[] = [];

  // Handle Expenses
  expenses.forEach((expense) => {
    const { paidBy, splitDetails } = expense;

    splitDetails.forEach((split) => {
      // If the user who paid is same as user who owes, skip (Rahul does not owe himself)
      if (split.userId !== paidBy) {
        ledger.push({
          from: split.userId,
          to: paidBy,
          amount: toCents(split.owedAmount),
        });
      }
    });
  });

  // Handle Settlements
  settlements.forEach((settlement) => {
    // A settlement from You (from) to Rahul (to) means You are paying Rahul 300.
    // In our ledger (A owes B), this is a debt from You to Rahul of -300.
    // When aggregated, this cancels out 300 of debt You -> Rahul.
    ledger.push({
      from: settlement.from,
      to: settlement.to,
      amount: -toCents(settlement.amount),
    });
  });

  return ledger;
};
