import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'styled-components/native';
import { listMyGroups } from '@/services/supabase/groups';
import { listExpensesByGroup } from '@/services/supabase/expenses';
import { listSettlementsByGroup } from '@/services/supabase/settlements';
import { useUser } from '@/shared/hooks/useUser';
import { useFriendBalances } from '@/features/friends/hooks/useFriendBalances';
import {
  getCategoryColor,
  toCategoryId,
  type CategoryId,
} from '@/features/analytics/utils/categoryConfig';
import {
  groupExpensesByDate,
  type TimeBucket,
} from '@/features/analytics/utils/groupExpensesByDate';
import type { Expense, Settlement, UserId } from '@/shared/types';
import type { ActivityItemType } from '@/features/activity/hooks/useActivity';

export interface FriendCategorySlice {
  category: CategoryId;
  amount: number;
  color: string;
}

export interface FriendTransaction {
  id: string;
  type: ActivityItemType;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  groupId: string;
}

export interface FriendAnalytics {
  netBalance: number;
  totalSpentTogether: number;
  whoPaidMore: { me: number; friend: number };
  categoryBreakdown: FriendCategorySlice[];
  spendOverTime: TimeBucket[];
  transactions: FriendTransaction[];
  sharedExpenses: Expense[];
  isLoading: boolean;
  isEmpty: boolean;
}

/**
 * Hook that derives analytics between the current user and `friendId`,
 * across every group they both belong to.
 *
 * Uses the same `['all-expenses', groupIds]` / `['all-settlements', groupIds]`
 * cache keys as {@link file://./../../balances/hooks/useBalances.ts}, so this
 * screen shares its data with the cross-group balance engine.
 */
export const useFriendAnalytics = (friendId: string): FriendAnalytics => {
  const { userId } = useUser();
  const theme = useTheme();
  const { getBalance } = useFriendBalances();

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: listMyGroups,
  });

  const groupIds = useMemo(() => groups.map((g) => g.id), [groups]);

  const { data: allExpenses = [], isLoading: loadingExp } = useQuery({
    queryKey: ['all-expenses', groupIds],
    queryFn: async () => {
      const results = await Promise.all(
        groupIds.map((gid: string) => listExpensesByGroup(gid))
      );
      return results.flat();
    },
    enabled: groupIds.length > 0,
  });

  const { data: allSettlements = [], isLoading: loadingSett } = useQuery({
    queryKey: ['all-settlements', groupIds],
    queryFn: async () => {
      const results = await Promise.all(
        groupIds.map((gid: string) => listSettlementsByGroup(gid))
      );
      return results.flat();
    },
    enabled: groupIds.length > 0,
  });

  return useMemo<FriendAnalytics>(() => {
    const sharedExpenses: Expense[] = allExpenses.filter(
      (e: Expense) => e.participants.includes(userId) && e.participants.includes(friendId)
    );

    const pairSettlements: Settlement[] = allSettlements.filter(
      (s: Settlement) =>
        (s.from === userId && s.to === friendId) ||
        (s.from === friendId && s.to === userId)
    );

    const totalSpentTogether = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);

    let paidByMe = 0;
    let paidByFriend = 0;
    for (const expense of sharedExpenses) {
      if (expense.paidBy === userId) paidByMe += expense.amount;
      else if (expense.paidBy === friendId) paidByFriend += expense.amount;
    }

    const categoryTotals = new Map<CategoryId, number>();
    for (const expense of sharedExpenses) {
      const mySplit = (expense.splitDetails ?? []).find(
        (s) => s.userId === userId
      );
      const myShare = mySplit?.owedAmount ?? 0;
      if (myShare <= 0) continue;
      const id = toCategoryId(expense.category);
      categoryTotals.set(id, (categoryTotals.get(id) ?? 0) + myShare);
    }
    const categoryBreakdown: FriendCategorySlice[] = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        color: getCategoryColor(theme, category),
      }))
      .sort((a, b) => b.amount - a.amount);

    const spendOverTime = groupExpensesByDate(sharedExpenses);

    const groupNameFor = (gid: string): string =>
      groups.find((g: { id: string; name: string }) => g.id === gid)?.name ?? 'Group';

    const expenseTxns: FriendTransaction[] = sharedExpenses.map((exp) => {
      const groupName = groupNameFor(exp.groupId);
      const mySplit = (exp.splitDetails ?? []).find((s) => s.userId === userId);
      const myOwed = mySplit?.owedAmount ?? 0;
      const title =
        exp.paidBy === userId
          ? `You paid for "${exp.title}"`
          : exp.paidBy === friendId
            ? `${'They'} paid for "${exp.title}"`
            : `Paid for "${exp.title}"`;
      const amount = exp.paidBy === userId ? exp.amount - myOwed : -myOwed;
      return {
        id: exp.id,
        type: 'EXPENSE' as ActivityItemType,
        title,
        subtitle: `In ${groupName}`,
        amount,
        date: exp.createdAt,
        groupId: exp.groupId,
      };
    });

    const settlementTxns: FriendTransaction[] = pairSettlements.map((set) => {
      const groupName = groupNameFor(set.groupId);
      const title =
        set.from === userId ? 'You settled up' : 'They settled up';
      const amount = set.from === userId ? set.amount : -set.amount;
      return {
        id: set.id,
        type: 'SETTLEMENT' as ActivityItemType,
        title,
        subtitle: `In ${groupName}`,
        amount,
        date: set.createdAt,
        groupId: set.groupId,
      };
    });

    const transactions = [...expenseTxns, ...settlementTxns].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      netBalance: getBalance(friendId).net,
      totalSpentTogether,
      whoPaidMore: { me: paidByMe, friend: paidByFriend },
      categoryBreakdown,
      spendOverTime,
      transactions,
      sharedExpenses,
      isLoading: loadingExp || loadingSett,
      isEmpty: sharedExpenses.length === 0 && pairSettlements.length === 0,
    };
  }, [
    allExpenses,
    allSettlements,
    groups,
    userId,
    friendId,
    theme,
    getBalance,
    loadingExp,
    loadingSett,
  ]);
};
