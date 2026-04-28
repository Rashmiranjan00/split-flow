import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listMyGroups } from '@/services/supabase/groups';
import { listExpensesByGroup } from '@/services/supabase/expenses';
import { listSettlementsByGroup } from '@/services/supabase/settlements';
import { calculateGroupBalances } from '@/shared/utils/balanceEngine';
import { useUser } from '@/shared/hooks/useUser';
import type { Balance, Expense, Settlement } from '@/shared/types';

/**
 * Hook to calculate and aggregate balances across all groups.
 * Sources data from Supabase via React Query.
 */
export const useBalances = () => {
  const { userId } = useUser();

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: listMyGroups,
  });

  const groupIds = useMemo(() => groups.map((g) => g.id), [groups]);

  const { data: allExpenses = [], isLoading: loadingExp } = useQuery({
    queryKey: ['all-expenses', groupIds],
    queryFn: async () => {
      const results = await Promise.all(
        groupIds.map((gid) => listExpensesByGroup(gid))
      );
      return results.flat();
    },
    enabled: groupIds.length > 0,
  });

  const { data: allSettlements = [], isLoading: loadingSett } = useQuery({
    queryKey: ['all-settlements', groupIds],
    queryFn: async () => {
      const results = await Promise.all(
        groupIds.map((gid) => listSettlementsByGroup(gid))
      );
      return results.flat();
    },
    enabled: groupIds.length > 0,
  });

  return useMemo(() => {
    let totalOwedToYou = 0;
    let totalYouOwe = 0;
    let allSimplifiedDebts: Balance[] = [];

    groups.forEach((group) => {
      const groupExpenses = allExpenses.filter((e: Expense) => e.groupId === group.id);
      const groupSettlements = allSettlements.filter((s: Settlement) => s.groupId === group.id);

      const { simplifiedDebts, netPositions } = calculateGroupBalances(
        groupExpenses,
        groupSettlements
      );

      allSimplifiedDebts = [...allSimplifiedDebts, ...simplifiedDebts];

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
      isLoading: loadingExp || loadingSett,
    };
  }, [groups, allExpenses, allSettlements, userId, loadingExp, loadingSett]);
};
