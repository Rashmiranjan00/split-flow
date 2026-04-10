import { useMemo } from 'react';
import { useExpenseStore } from '@/features/expenses/store';
import { useSettlementStore } from '@/features/settlements/store';
import { calculateGroupBalances, GroupBalancesResult } from '@/shared/utils/balanceEngine';

/**
 * Hook to fetch and calculate balances for a specific group.
 * Automatically recalculates when expenses or settlements change.
 */
export const useGroupBalances = (groupId: string): GroupBalancesResult => {
  const expenses = useExpenseStore((state) => state.expenses);
  const settlements = useSettlementStore((state) => state.settlements);

  return useMemo(() => {
    const groupExpenses = expenses.filter((e) => e.groupId === groupId);
    const groupSettlements = settlements.filter((s) => s.groupId === groupId);

    return calculateGroupBalances(groupExpenses, groupSettlements);
  }, [expenses, settlements, groupId]);
};
