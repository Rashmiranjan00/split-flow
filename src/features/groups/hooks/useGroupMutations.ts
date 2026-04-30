import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/supabase/queryKeys';
import { createGroup, addGroupMember, deleteGroup } from '@/services/supabase/groups';
import type { Group } from '@/shared/types';

export const useCreateGroupMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
};

export const useAddGroupMemberMutation = (groupId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => addGroupMember(groupId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
};

export const useDeleteGroupMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onMutate: async (groupId) => {
      await qc.cancelQueries({ queryKey: queryKeys.groups });
      const previousGroups = qc.getQueryData<Group[]>(queryKeys.groups);
      qc.setQueryData<Group[]>(queryKeys.groups, (old) => old?.filter((g) => g.id !== groupId));
      return { previousGroups };
    },
    onError: (_err, _groupId, context) => {
      if (context?.previousGroups) {
        qc.setQueryData(queryKeys.groups, context.previousGroups);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
};
