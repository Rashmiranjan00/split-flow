import { Balance, UserId } from '@/shared/types';

/**
 * Calculate each user's net position.
 * Positive = creditor (should receive money)
 * Negative = debtor (owes money)
 */
export const calculateNetPositions = (
  balances: Balance[], 
  userIds: UserId[] = []
): Record<UserId, number> => {
  const positions: Record<UserId, number> = {};

  // Initialize with 0 for all known users
  userIds.forEach(id => {
    positions[id] = 0;
  });

  balances.forEach((b) => {
    positions[b.from] = (positions[b.from] || 0) - b.amount;
    positions[b.to] = (positions[b.to] || 0) + b.amount;
  });

  return positions;
};
