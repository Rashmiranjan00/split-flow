import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listExpensesByGroup } from '@/services/supabase/expenses';
import { listSettlementsByGroup } from '@/services/supabase/settlements';
import {
  calculateGroupBalances,
  GroupBalancesResult,
} from '@/shared/utils/balanceEngine';

/**
 * Hook to fetch and calculate balances for a specific group.
 * Feeds the balance engine with server data via React Query.
 */
export const useGroupBalances = (groupId: string): GroupBalancesResult & { isLoading: boolean } => {
  const { data: expenses = [], isLoading: loadingExp } = useQuery({
    queryKey: queryKeys.expenses(groupId),
    queryFn: () => listExpensesByGroup(groupId),
    enabled: !!groupId,
  });

  const { data: settlements = [], isLoading: loadingSett } = useQuery({
    queryKey: queryKeys.settlements(groupId),
    queryFn: () => listSettlementsByGroup(groupId),
    enabled: !!groupId,
  });

  const result = useMemo(
    () => calculateGroupBalances(expenses, settlements),
    [expenses, settlements]
  );

  return {
    ...result,
    isLoading: loadingExp || loadingSett,
  };
};
