import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { createSettlement } from '@/services/supabase/settlements';
import type { Settlement } from '@/shared/types';

interface CreateSettlementInput {
  groupId: string;
  fromUser: string;
  toUser: string;
  amount: number;
  note?: string;
}

export const useCreateSettlementMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSettlementInput) => createSettlement(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: queryKeys.settlements(input.groupId) });
      await qc.cancelQueries({ queryKey: ['all-settlements'] });

      const previousSettlements = qc.getQueryData<Settlement[]>(
        queryKeys.settlements(input.groupId)
      );

      const optimistic: Settlement = {
        id: `optimistic-${Date.now()}`,
        groupId: input.groupId,
        from: input.fromUser,
        to: input.toUser,
        amount: input.amount,
        note: input.note,
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<Settlement[]>(queryKeys.settlements(input.groupId), (old) => [
        optimistic,
        ...(old ?? []),
      ]);

      return { previousSettlements };
    },
    onError: (_err, variables, context) => {
      if (context?.previousSettlements) {
        qc.setQueryData(queryKeys.settlements(variables.groupId), context.previousSettlements);
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.settlements(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.expenses(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.group(variables.groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groups });
      qc.invalidateQueries({ queryKey: ['all-settlements'] });
    },
  });
};
