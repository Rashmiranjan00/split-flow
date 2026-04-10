import { useMemo } from 'react';
import { useExpenseStore } from '@/features/expenses/store';
import { useSettlementStore } from '@/features/settlements/store';
import { useGroupStore } from '@/features/groups/store';
import { useUser } from '@/shared/hooks/useUser';

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
  const expenses = useExpenseStore((state) => state.expenses);
  const settlements = useSettlementStore((state) => state.settlements);
  const groups = useGroupStore((state) => state.groups);

  return useMemo(() => {
    // Transform Expenses
    const expenseActivities: ActivityItemData[] = expenses.map((exp) => {
      const group = groups.find((g) => g.id === exp.groupId);
      const groupName = group?.name ?? 'Group';
      
      // Defensive check for splitDetails
      const splitDetails = exp.splitDetails || [];
      const mySplit = splitDetails.find((s) => s.userId === userId);
      const myOwed = mySplit?.owedAmount ?? 0;

      let title = '';
      let amount = 0;

      if (exp.paidBy === userId) {
        title = `You paid for "${exp.title}"`;
        amount = exp.amount - myOwed; // Net positive (others owe you)
      } else {
        const payer = group?.members?.includes(exp.paidBy) ? 'Someone' : 'Someone'; 
        title = `${payer} paid for "${exp.title}"`;
        amount = -myOwed; // Net negative (you owe)
      }

      return {
        id: exp.id,
        type: 'EXPENSE',
        title,
        subtitle: `In ${groupName}`,
        amount,
        date: exp.createdAt,
        groupId: exp.groupId,
      };
    });

    // Transform Settlements
    const settlementActivities: ActivityItemData[] = settlements.map((set) => {
      const group = groups.find((g) => g.id === set.groupId);
      const groupName = group?.name ?? 'Group';
      
      let title = '';
      let amount = 0;

      if (set.from === userId) {
        title = `You paid someone`;
        amount = set.amount; // Reducing what you owe
      } else {
        title = `Someone paid you`;
        amount = -set.amount; // Reducing what they owe you
      }

      return {
        id: set.id,
        type: 'SETTLEMENT',
        title,
        subtitle: `In ${groupName}`,
        amount,
        date: set.createdAt,
        groupId: set.groupId,
      };
    });

    // Merge and sort
    const allActivity = [...expenseActivities, ...settlementActivities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      activity: allActivity,
      recent: allActivity.slice(0, 10),
      isEmpty: allActivity.length === 0,
    };
  }, [expenses, settlements, groups, userId]);
};
