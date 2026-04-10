import { Balance } from '@/shared/types';

/**
 * Multiple expenses may create multiple debts between the same users.
 * Aggregate balances between identical user pairs (From: A, To: B).
 */
export const aggregateBalances = (balances: Balance[]): Balance[] => {
  const aggregated: Record<string, number> = {};

  balances.forEach((b) => {
    const key = `${b.from}_${b.to}`;
    aggregated[key] = (aggregated[key] || 0) + b.amount;
  });

  return Object.entries(aggregated).map(([key, amount]) => {
    const [from, to] = key.split('_');
    return { from, to, amount };
  });
};
