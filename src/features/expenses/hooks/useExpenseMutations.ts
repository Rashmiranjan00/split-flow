import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { createExpense } from '@/services/supabase/expenses';
import type { SplitDetail } from '@/shared/types';

interface CreateExpenseInput {
  groupId: string;
  title: string;
  amount: number;
  paidBy: string;
  splitType: string;
  category?: string;
  participants: string[];
  splitDetails: SplitDetail[];
}

export const useCreateExpenseMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.expenses(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.settlements(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.group(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groups });
      qc.invalidateQueries({ queryKey: ['all-expenses'] });
    },
  });
};
