import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'styled-components/native';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listExpensesByGroup } from '@/services/supabase/expenses';
import { listSettlementsByGroup } from '@/services/supabase/settlements';
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

export interface CategoryBreakdownSlice {
  category: CategoryId;
  amount: number;
  color: string;
}

export interface MemberContribution {
  userId: UserId;
  paid: number;
  owed: number;
}

export interface GroupAnalytics {
  totalSpend: number;
  expenseCount: number;
  settlementCount: number;
  categoryBreakdown: CategoryBreakdownSlice[];
  memberContribution: MemberContribution[];
  spendOverTime: TimeBucket[];
  topExpense: Expense | null;
  expenses: Expense[];
  settlements: Settlement[];
  isLoading: boolean;
  isEmpty: boolean;
}

/**
 * Hook that derives contextual analytics for a single group.
 *
 * Piggybacks on the same React Query keys used by
 * {@link file://./../../balances/hooks/useGroupBalances.ts}, so once a group
 * detail screen has loaded balances the Insights tab is effectively free.
 *
 * All computation runs client-side inside a single memo; the hook never hits
 * Supabase for analytics specifically.
 */
export const useGroupAnalytics = (groupId: string): GroupAnalytics => {
  const theme = useTheme();

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

  return useMemo<GroupAnalytics>(() => {
    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals = new Map<CategoryId, number>();
    for (const expense of expenses) {
      const id = toCategoryId(expense.category);
      categoryTotals.set(id, (categoryTotals.get(id) ?? 0) + expense.amount);
    }
    const categoryBreakdown: CategoryBreakdownSlice[] = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        color: getCategoryColor(theme, category),
      }))
      .sort((a, b) => b.amount - a.amount);

    const paidMap = new Map<UserId, number>();
    const owedMap = new Map<UserId, number>();
    for (const expense of expenses) {
      paidMap.set(expense.paidBy, (paidMap.get(expense.paidBy) ?? 0) + expense.amount);
      for (const split of expense.splitDetails ?? []) {
        owedMap.set(split.userId, (owedMap.get(split.userId) ?? 0) + split.owedAmount);
      }
    }
    const memberIds = new Set<UserId>([...paidMap.keys(), ...owedMap.keys()]);
    const memberContribution: MemberContribution[] = Array.from(memberIds)
      .map((userId) => ({
        userId,
        paid: paidMap.get(userId) ?? 0,
        owed: owedMap.get(userId) ?? 0,
      }))
      .sort((a, b) => b.paid - a.paid);

    const spendOverTime = groupExpensesByDate(expenses);

    const topExpense =
      expenses.length === 0
        ? null
        : expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);

    return {
      totalSpend,
      expenseCount: expenses.length,
      settlementCount: settlements.length,
      categoryBreakdown,
      memberContribution,
      spendOverTime,
      topExpense,
      expenses,
      settlements,
      isLoading: loadingExp || loadingSett,
      isEmpty: expenses.length === 0,
    };
  }, [expenses, settlements, theme, loadingExp, loadingSett]);
};
