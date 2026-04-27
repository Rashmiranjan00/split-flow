import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listMyGroups } from '@/services/supabase/groups';
import { listExpensesByGroup } from '@/services/supabase/expenses';
import { listSettlementsByGroup } from '@/services/supabase/settlements';
import { useUser } from '@/shared/hooks/useUser';
import type { Expense, Settlement } from '@/shared/types';

export type ActivityItemType = 'EXPENSE' | 'SETTLEMENT';

export interface ActivityItemData {
  id: string;
  type: ActivityItemType;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  groupId: string;
}

/**
 * Hook to get unified activity feed from expenses and settlements.
 */
export const useActivity = () => {
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
    const expenseActivities: ActivityItemData[] = allExpenses.map((exp: Expense) => {
      const group = groups.find((g) => g.id === exp.groupId);
      const groupName = group?.name ?? 'Group';
      const splitDetails = exp.splitDetails || [];
      const mySplit = splitDetails.find((s) => s.userId === userId);
      const myOwed = mySplit?.owedAmount ?? 0;

      let title = '';
      let amount = 0;

      if (exp.paidBy === userId) {
        title = `You paid for "${exp.title}"`;
        amount = exp.amount - myOwed;
      } else {
        title = `Someone paid for "${exp.title}"`;
        amount = -myOwed;
      }

      return {
        id: exp.id,
        type: 'EXPENSE' as const,
        title,
        subtitle: `In ${groupName}`,
        amount,
        date: exp.createdAt,
        groupId: exp.groupId,
      };
    });

    const settlementActivities: ActivityItemData[] = allSettlements.map(
      (set: Settlement) => {
        const group = groups.find((g) => g.id === set.groupId);
        const groupName = group?.name ?? 'Group';

        let title = '';
        let amount = 0;

        if (set.from === userId) {
          title = 'You paid someone';
          amount = set.amount;
        } else {
          title = 'Someone paid you';
          amount = -set.amount;
        }

        return {
          id: set.id,
          type: 'SETTLEMENT' as const,
          title,
          subtitle: `In ${groupName}`,
          amount,
          date: set.createdAt,
          groupId: set.groupId,
        };
      }
    );

    const allActivity = [...expenseActivities, ...settlementActivities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      activity: allActivity,
      recent: allActivity.slice(0, 10),
      isEmpty: allActivity.length === 0,
      isLoading: loadingExp || loadingSett,
    };
  }, [allExpenses, allSettlements, groups, userId, loadingExp, loadingSett]);
};
