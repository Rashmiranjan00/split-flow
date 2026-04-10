import { Expense, Settlement, Balance, UserId } from '@/shared/types';
import { buildLedger } from './buildLedger';
import { aggregateBalances } from './aggregateBalances';
import { netBalances } from './netBalances';
import { calculateNetPositions } from './calculateNetPositions';
import { simplifyDebts } from './simplifyDebts';
import { fromCents } from './money';

export interface GroupBalancesResult {
  balances: Balance[];
  simplifiedDebts: Balance[];
  netPositions: Record<UserId, number>;
}

/**
 * Full Balance Engine
 * Orchestrates the balance calculation pipeline.
 * Returns results in human-readable (float) format.
 */
export const calculateGroupBalances = (
  expenses: Expense[],
  settlements: Settlement[] = []
): GroupBalancesResult => {
  // 1. Build raw ledger (cents)
  const rawLedger = buildLedger(expenses, settlements);

  // 2. Aggregate balances (cents)
  const aggregated = aggregateBalances(rawLedger);

  // 3. Net balances (cents)
  const netted = netBalances(aggregated);

  // 4. Collect all User IDs participating in this group calculation
  const userIds = new Set<UserId>();
  expenses.forEach(e => {
    userIds.add(e.paidBy);
    e.participants.forEach(p => userIds.add(p));
  });
  settlements.forEach(s => {
    userIds.add(s.from);
    userIds.add(s.to);
  });

  // 5. Calculate net positions (cents)
  const netPositionsCents = calculateNetPositions(netted, Array.from(userIds));

  // 6. Simplify debts (cents)
  const simplifiedCents = simplifyDebts(netPositionsCents);

  // Helper to convert cent-based balances back to floats
  const toFloatBalance = (b: Balance): Balance => ({
    ...b,
    amount: fromCents(b.amount),
  });

  // Convert net positions back to floats
  const netPositions: Record<UserId, number> = {};
  Object.entries(netPositionsCents).forEach(([userId, amount]) => {
    netPositions[userId] = fromCents(amount);
  });

  return {
    balances: netted.map(toFloatBalance),
    simplifiedDebts: simplifiedCents.map(toFloatBalance),
    netPositions,
  };
};
