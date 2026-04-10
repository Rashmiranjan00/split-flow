import { useMemo } from 'react';
import { useGroupStore } from '@/features/groups/store';
import { useExpenseStore } from '@/features/expenses/store';
import { useSettlementStore } from '@/features/settlements/store';
import { calculateGroupBalances } from '@/shared/utils/balanceEngine';
import { useUser } from '@/shared/hooks/useUser';
import { Balance } from '@/shared/types';

/**
 * Hook to calculate and aggregate balances across all groups.
 */
export const useBalances = () => {
  const { userId } = useUser();
  const groups = useGroupStore((state) => state.groups);
  const expenses = useExpenseStore((state) => state.expenses);
  const settlements = useSettlementStore((state) => state.settlements);

  return useMemo(() => {
    let totalOwedToYou = 0;
    let totalYouOwe = 0;
    let allSimplifiedDebts: Balance[] = [];

    groups.forEach((group) => {
      const groupExpenses = expenses.filter((e) => e.groupId === group.id);
      const groupSettlements = settlements.filter((s) => s.groupId === group.id);
      
      const { simplifiedDebts, netPositions } = calculateGroupBalances(
        groupExpenses,
        groupSettlements
      );

      // Add to global simplified debts
      allSimplifiedDebts = [...allSimplifiedDebts, ...simplifiedDebts];

      // Update global totals from user's perspective
      const myPosition = netPositions[userId] || 0;
      if (myPosition > 0) {
        totalOwedToYou += myPosition;
      } else if (myPosition < 0) {
        totalYouOwe += Math.abs(myPosition);
      }
    });

    return {
      totalOwedToYou,
      totalYouOwe,
      netBalance: totalOwedToYou - totalYouOwe,
      simplifiedDebts: allSimplifiedDebts,
      isEmpty: allSimplifiedDebts.length === 0,
    };
  }, [groups, expenses, settlements, userId]);
};
