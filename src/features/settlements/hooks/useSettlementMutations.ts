import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { createSettlement } from '@/services/supabase/settlements';

interface CreateSettlementInput {
  groupId: string;
  fromUser: string;
  toUser: string;
  amount: number;
}

export const useCreateSettlementMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSettlementInput) => createSettlement(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.settlements(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.expenses(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.group(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groups });
      qc.invalidateQueries({ queryKey: ['all-settlements'] });
    },
  });
};
